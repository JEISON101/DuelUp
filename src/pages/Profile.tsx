import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Camera,
  LogOut,
  Save,
  Trophy,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { updateProfile } from "../services/profile";
import { signOut } from "../services/auth";
import { Footer } from "../components/ui/Footer";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUsername(profile?.username ?? "");
  }, [profile?.username]);

  useEffect(() => {
    if (!avatarFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Sesión cerrada correctamente.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error("No pudimos cerrar la sesión.");
      console.error(error);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await updateProfile(username, avatarFile);
      await refreshProfile();
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Perfil actualizado.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos actualizar el perfil.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const visibleAvatar = previewUrl ?? profile?.avatar_url;
  const handleAvatarChange = (file?: File) => {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      )
    ) {
      toast.error("Selecciona una imagen JPG, PNG, WEBP o GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar los 5 MB.");
      return;
    }
    setAvatarFile(file);
  };

  const avatarSize = "h-36 w-36 sm:h-48 sm:w-48";
  const avatarBorder =
    "rounded-full border-2 border-[rgba(245,197,66,0.55)] shadow-[0_10px_34px_rgba(0,0,0,0.3),0_0_26px_rgba(39,116,239,0.14)]";

  return (
    <main className="bg-page min-h-screen px-4 pt-7 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-100/[0.52]">
              DuelUP / Cuenta
            </p>
            <h1 className="mt-1 text-3xl font-bold">Tu perfil</h1>
          </div>

          <div className="flex gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            leftIcon={<LogOut size={16} />}
          >
            Cerrar sesión
          </Button>
          <Button
            type="button"
            variant="ghost"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate("/app/home")}
          >
            Volver a Home
          </Button>
          </div>
        </header>

        <form onSubmit={(event) => void handleSubmit(event)}>
          <Card className="grid gap-6 p-5 md:grid-cols-[260px_minmax(0,1fr)] md:gap-8 md:p-8">
            {/* LADO IZQUIERDO */}
            <aside className="flex flex-col items-center border-b border-white/[0.09] pb-6 text-center md:border-b-0 md:border-r md:pb-0 md:pr-8">
              <div className="relative">
                {visibleAvatar ? (
                  <img
                    className={`${avatarSize} ${avatarBorder} object-cover`}
                    src={visibleAvatar}
                    alt={`Avatar de ${username || "jugador"}`}
                  />
                ) : (
                  <span
                    className={`${avatarSize} ${avatarBorder} grid place-items-center bg-[linear-gradient(145deg,#2774ef,#7d4dec)] text-5xl font-bold`}
                    aria-hidden="true"
                  >
                    {(username || user?.email || "J")[0].toUpperCase()}
                  </span>
                )}

                <button
                  type="button"
                  className="absolute bottom-0.5 right-0.5 grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[rgba(245,197,66,0.62)] bg-[#151d34] text-[#f5c542] hover:bg-[#202c4a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5c542]"
                  aria-label="Elegir imagen de perfil"
                  title="Elegir imagen de perfil"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={17} />
                </button>

                <input
                  ref={fileInputRef}
                  className="sr-only"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) =>
                    handleAvatarChange(event.target.files?.[0])
                  }
                />
              </div>

              <h2 className="mt-4 w-full truncate text-xl font-semibold">
                {username || "Jugador"}
              </h2>
              <p className="mt-1 w-full break-all text-sm text-white-muted">
                {user?.email ?? "Sin email disponible"}
              </p>

              <div className="mt-5 inline-flex items-center gap-[0.45rem] rounded-full border border-[rgba(245,197,66,0.24)] bg-[rgba(245,197,66,0.07)] px-3 py-[0.45rem] text-[0.83rem] font-semibold text-[#f5c542]">
                <Trophy size={16} />
                <span>{profile?.xp ?? 0} XP</span>
              </div>
            </aside>

            {/* LADO DERECHO */}
            <section className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-[9px] border border-[rgba(120,170,255,0.22)] bg-[rgba(39,116,239,0.12)] text-[#91b7ff]">
                    <UserRound size={17} />
                  </span>
                  <div>
                    <h2 className="font-semibold">Información pública</h2>
                    <p className="mt-1 text-sm text-white-muted">
                      Así te verán tus rivales.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Input
                  label="Nombre de usuario"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  minLength={3}
                  maxLength={24}
                  autoComplete="nickname"
                  required
                />
                <p className="text-xs text-white-muted">
                  De 3 a 24 caracteres: letras, números o guion bajo.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.09] pt-4">
                <p className="text-xs text-white-muted">
                  Los cambios también aparecerán en tus partidas.
                </p>
                <Button
                  type="submit"
                  leftIcon={<Save size={16} />}
                  isLoading={isSaving}
                >
                  Guardar cambios
                </Button>
              </div>
            </section>
          </Card>
        </form>
      </div>

      <Footer/>
    </main>
  );
};

export default Profile;
