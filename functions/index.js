const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const bucket = admin.storage().bucket();

exports.cleanupSoldInventory = onSchedule(
  {
    schedule: "every day 03:00",
    timeZone: "Asia/Colombo",
    retryCount: 1,
  },
  async () => {
    const now = new Date();

    logger.info("Starting sold inventory cleanup", {
      now: now.toISOString(),
    });

    const snapshot = await db
      .collection("inventory")
      .where("isSold", "==", true)
      .where("deleteAfter", "<=", now)
      .get();

    if (snapshot.empty) {
      logger.info("No sold inventory found");
      return;
    }

    let deletedCount = 0;

    for (const docSnap of snapshot.docs) {
      const item = docSnap.data();

      const deleteAfter = item?.deleteAfter?.toDate
        ? item.deleteAfter.toDate()
        : item?.deleteAfter
        ? new Date(item.deleteAfter)
        : null;

      if (!deleteAfter || deleteAfter > now) {
        continue;
      }

      try {
        if (item.imagePath) {
          try {
            await bucket.file(item.imagePath).delete();
          } catch (error) {
            logger.warn("Failed deleting main image", {
              docId: docSnap.id,
              imagePath: item.imagePath,
              error: error.message,
            });
          }
        }

        if (item.thumbnailPath) {
          try {
            await bucket.file(item.thumbnailPath).delete();
          } catch (error) {
            logger.warn("Failed deleting thumbnail", {
              docId: docSnap.id,
              thumbnailPath: item.thumbnailPath,
              error: error.message,
            });
          }
        }

        await docSnap.ref.delete();
        deletedCount += 1;

        logger.info("Deleted sold inventory item", {
          docId: docSnap.id,
        });
      } catch (error) {
        logger.error("Failed deleting sold inventory item", {
          docId: docSnap.id,
          error: error.message,
        });
      }
    }

    logger.info("Sold inventory cleanup finished", {
      deletedCount,
    });
  }
);