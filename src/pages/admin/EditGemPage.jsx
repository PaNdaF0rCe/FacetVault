import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getDocument } from "../../lib/firebase/db-operations";
import Toast from "../../components/Toast";
import { GemFormPage } from "./AddGemPage";

function EditGemPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [gem, setGem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadGem() {
      if (!id || !user?.uid) return;

      setIsLoading(true);

      try {
        const item = await getDocument("inventory", id);

        if (!isMounted) return;

        if (item.userId !== user.uid) {
          setToast({
            type: "error",
            title: "Access denied",
            message: "You do not have permission to edit this gem.",
          });
          setGem(null);
          return;
        }

        setGem(item);
      } catch (error) {
        console.error("Error loading gem for edit:", error);
        if (!isMounted) return;
        setToast({
          type: "error",
          title: "Load failed",
          message: "Could not load this gem for editing.",
        });
        setGem(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadGem();

    return () => {
      isMounted = false;
    };
  }, [id, user?.uid]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <section className="rounded-3xl border border-white/10 bg-[#020617]/90 p-6">
          <div className="h-6 w-40 rounded bg-white/5" />
          <div className="mt-4 h-4 w-64 rounded bg-white/5" />
        </section>
        <section className="rounded-3xl border border-white/10 bg-[#020617]/90 p-6">
          <div className="h-64 rounded-3xl bg-white/5" />
        </section>
      </div>
    );
  }

  if (!gem) {
    return (
      <div className="space-y-4">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <section className="rounded-3xl border border-white/10 bg-[#020617]/90 p-6 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-red-400/80">
            Edit unavailable
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            Gem not found
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            This gem could not be loaded or you do not have access to it.
          </p>
        </section>
      </div>
    );
  }

  return <GemFormPage mode="edit" initialData={gem} gemId={id} />;
}

export default EditGemPage;