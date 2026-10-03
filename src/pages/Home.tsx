import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Gamepad,
  LogOut,
  Swords,
  Trophy,
  User2Icon,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { useGameChallenges } from "../hooks/useGameChallenges";
import { signOut } from "../services/auth";
import { getTopProfiles } from "../services/profile";
import { findGameForRequest } from "../services/gameRequests";
import SpriteAnimation from "../components/ui/SpriteAnimation";
import { Footer } from "../components/ui/Footer";

const Home = () => {
  const navigate = useNavigate();
  const { user, profile, onlinePlayers } = useAuth();
  const challenges = useGameChallenges(user?.id);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const previousRequestStatuses = useRef(new Map<string, string>());
  const handledAcceptedRequests = useRef(new Set<string>());
  const hasLoadedRequests = useRef(false);
  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard", "top-xp"],
    queryFn: getTopProfiles,
    staleTime: 60_000,
  });

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user?.id || challenges.isLoading) return;

    challenges.requests.forEach((request) => {
      const previousStatus = previousRequestStatuses.current.get(request.id);
      if (
        hasLoadedRequests.current &&
        request.sender_id === user.id &&
        previousStatus === "pendiente" &&
        request.status === "aceptado" &&
        !handledAcceptedRequests.current.has(request.id)
      ) {
        handledAcceptedRequests.current.add(request.id);
        void findGameForRequest(request)
          .then((gameId) => {
            if (!gameId) {
              toast.error("No pudimos encontrar la partida de tu desafío.");
              return;
            }
            toast.success("Tu desafío fue aceptado. ¡La partida está lista!");
            navigate(`/app/games/${gameId}`);
          })
          .catch((error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : "No pudimos abrir la partida.",
            );
          });
      }
      previousRequestStatuses.current.set(request.id, request.status);
    });
    hasLoadedRequests.current = true;
  }, [challenges.isLoading, challenges.requests, navigate, user?.id]);
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

  const handleChallenge = async (playerId: string) => {
    try {
      await challenges.sendChallenge(playerId);
      toast.success("Desafío enviado.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos enviar el desafío.",
      );
    }
  };

  const handleRequest = async (
    requestId: string,
    action: "accept" | "reject",
  ) => {
    try {
      if (action === "accept") {
        const gameId = await challenges.acceptChallenge(requestId);
        toast.success("Desafío aceptado. ¡La partida está lista!");
        navigate(`/app/games/${gameId}`);
      } else {
        await challenges.rejectChallenge(requestId);
        toast.success("Desafío rechazado.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos actualizar el desafío.",
      );
    }
  };

  const pendingRequests = challenges.requests.filter(
    (request) => request.status === "pendiente",
  );

  return (
    <div className="min-h-screen px-4 py-7 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username || user?.email}
                  className="w-12 h-12 object-cover border border-white rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-purple rounded-full border border-white uppercase flex items-center justify-center">
                  <p className="text-2xl font-bold">
                    {profile?.username
                      ? profile.username[0]
                      : user?.email
                        ? user.email[0]
                        : "P"}
                  </p>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h1 className="uppercase tracking-[0.2em] text-purple">DuelUP</h1>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-gold-muted px-3 py-1 text-sm text-gold">
                  <Trophy size={16} />
                  <span>{profile?.xp ?? 0} XP</span>
                </div>
              </div>
              <p>{profile?.username ?? user?.email ?? "Jugador"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/app/profile")}
              leftIcon={<User2Icon size={16} />}
            >
              Perfil
            </Button>
            <Button
              onClick={() => navigate("/app/games")}
              leftIcon={<Gamepad size={16} />}
            >
              Partidas
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              leftIcon={<LogOut size={16} />}
            >
              Cerrar sesión
            </Button>
          </div>
        </header>

        <section className="grid overflow-hidden rounded-2xl border border-white/10 bg-transparent lg:min-h-[410px] lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="flex flex-col justify-center p-6 sm:p-9">
              <h2 className="max-w-xl text-3xl font-bold leading-tight sm:text-4xl">
                <span className="text-purple">Gana cada duelo y </span>
                Aprende algo nuevo.
              </h2>

            <div className="flex items-center justify-center">
              <SpriteAnimation />
            </div>
              <p className="mt-5 max-w-xl text-sm leading-6 text-white-muted sm:text-base">
                Diviértete mientras aprendes: reta a otros jugadores, pon a
                prueba lo que sabes y suma experiencia en cada partida.
              </p>
            </div>
          </div>  

                    <div className="p-6 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-semibold text-white">
                <Users size={18} className="text-blue" />
                Jugadores conectados
              </h3>
              <span className="text-xs text-white-muted">
                {
                  onlinePlayers.filter((player) => player.userId !== user?.id)
                    .length
                }{" "}
                activos
              </span>
            </div>

            {onlinePlayers.filter((player) => player.userId !== user?.id)
              .length ? (
              <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                {onlinePlayers
                  .filter((player) => player.userId !== user?.id)
                  .map((player) => {
                    const playerName = player.username || "Jugador";

                    return (
                      <article
                        key={player.userId}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-page/70 p-3"
                      >
                        {player.avatarUrl ? (
                          <img
                            src={player.avatarUrl}
                            alt={playerName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            aria-hidden="true"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-purple text-lg font-bold uppercase"
                          >
                            {playerName[0]}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{playerName}</p>
                          <p className="flex items-center gap-1.5 text-xs text-green-300">
                            <span className="h-2 w-2 rounded-full bg-green-400" />
                            Conectado
                          </p>
                        </div>
                        <Button
                          size="sm"
                          leftIcon={<Swords size={15} />}
                          isLoading={challenges.isSending}
                          disabled={challenges.requests.some(
                            (request) =>
                              request.status === "pendiente" &&
                              [request.sender_id, request.receiver_id].includes(
                                player.userId,
                              ),
                          )}
                          onClick={() => void handleChallenge(player.userId)}
                        >
                          {challenges.requests.some(
                            (request) =>
                              request.status === "pendiente" &&
                              [request.sender_id, request.receiver_id].includes(
                                player.userId,
                              ),
                          )
                            ? "Pendiente"
                            : "Desafiar"}
                        </Button>
                      </article>
                    );
                  })}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-white/15 px-4 py-5 text-sm text-white-muted">
                Todavía no hay otros jugadores conectados. Cuando alguien entre,
                aparecerá aquí.
              </p>
            )}
          </div>     
        </section>

        <section className="space-y-3" aria-labelledby="challenges-title">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                Duelo
              </p>
              <h2 id="challenges-title" className="mt-1 text-2xl font-bold">
                Desafíos
              </h2>
            </div>
            <span
              className={`text-xs ${challenges.realtimeStatus === "SUBSCRIBED" ? "text-green-300" : "text-gold"}`}
            >
              {challenges.realtimeStatus === "SUBSCRIBED"
                ? "Tiempo real conectado"
                : challenges.realtimeStatus === "CHANNEL_ERROR" ||
                    challenges.realtimeStatus === "TIMED_OUT"
                  ? "Tiempo real no disponible; comprobando periódicamente"
                  : "Conectando tiempo real..."}
            </span>
          </div>

          {challenges.isError ? (
            <p className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
              No pudimos cargar los desafíos. Revisa las tablas y permisos de
              Supabase.
            </p>
          ) : challenges.isLoading ? (
            <p className="py-5 text-sm text-white-muted">
              Cargando desafíos...
            </p>
          ) : pendingRequests.length ? (
            <div className="space-y-2">
              {pendingRequests.map((request) => {
                const isIncoming = request.receiver_id === user?.id;
                const otherPlayer = isIncoming
                  ? request.sender
                  : request.receiver;
                const playerName = otherPlayer?.username || "Jugador";
                const isProcessing =
                  challenges.processingRequestId === request.id;
                const expiresAt = request.expires_at
                  ? Date.parse(request.expires_at)
                  : Date.parse(request.created_at) + 30_000;
                const secondsLeft = Math.max(
                  0,
                  Math.ceil((expiresAt - currentTime) / 1000),
                );
                const isExpired = secondsLeft === 0;

                return (
                  <article
                    key={request.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-navy/70 p-3"
                  >
                    {otherPlayer?.avatar_url ? (
                      <img
                        src={otherPlayer.avatar_url}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-purple text-lg font-bold uppercase"
                      >
                        {playerName[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{playerName}</p>
                      <p className="text-xs text-white-muted">
                        {isIncoming ? "Te desafió" : "Desafío enviado"} ·{" "}
                        {new Date(request.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold ${isExpired ? "text-white-muted" : "text-gold"}`}>
                      {isExpired
                        ? "Expirada"
                        : `Exprira en 00:${String(secondsLeft).padStart(2, "0")}`}
                    </span>
                    {isIncoming ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          isLoading={isProcessing}
                          disabled={isExpired}
                          onClick={() =>
                            void handleRequest(request.id, "accept")
                          }
                        >
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isProcessing || isExpired}
                          onClick={() =>
                            void handleRequest(request.id, "reject")
                          }
                        >
                          Rechazar
                        </Button>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/15 px-4 py-5 text-sm text-white-muted">
              Todavía no tienes desafíos. Reta a alguien que esté conectado.
            </p>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                Tabla de líderes
              </p>
              <h2 className="mt-1 text-2xl font-bold">Los 3 con más XP</h2>
            </div>
            <p className="text-sm text-white-muted">
              El conocimiento también se juega.
            </p>
          </div>

          {leaderboardQuery.isError ? (
            <p className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
              No pudimos cargar el ranking. Revisa los permisos de lectura de
              `profiles` en Supabase.
            </p>
          ) : leaderboardQuery.isLoading ? (
            <p className="py-8 text-center text-sm text-white-muted">
              Cargando ranking...
            </p>
          ) : leaderboardQuery.data?.length ? (
            <div className="flex min-h-[310px] items-end justify-center gap-3 border-b border-white/10 px-2 pt-16 sm:gap-8">
              {leaderboardQuery.data.map((player, index) => {
                const maxXp = Math.max(
                  ...leaderboardQuery.data.map((entry) => entry.xp ?? 0),
                  1,
                );
                const barHeight = Math.max(
                  66,
                  Math.round(((player.xp ?? 0) / maxXp) * 190),
                );
                const playerName = player.username || "Jugador";

                return (
                  <div
                    key={player.id}
                    className="flex w-1/3 max-w-44 flex-col items-center text-center"
                  >
                    {player.avatar_url ? (
                      <img
                        src={player.avatar_url}
                        alt={playerName}
                        className="mb-2 h-12 w-12 rounded-full border-2 border-white/30 object-cover"
                      />
                    ) : (
                      <div
                        aria-label={playerName}
                        className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/30 bg-purple text-lg font-bold uppercase"
                      >
                        {playerName[0]}
                      </div>
                    )}
                    <p
                      className="w-full truncate text-sm font-medium"
                      title={playerName}
                    >
                      {playerName}
                    </p>
                    <p className="mb-2 text-xs text-gold">
                      {player.xp ?? 0} XP
                    </p>
                    <div
                      aria-label={`${playerName}: ${player.xp ?? 0} XP, puesto ${index + 1}`}
                      className={`flex w-full items-start justify-center rounded-t-lg pt-3 ${index === 0 ? "bg-gold/80" : index === 1 ? "bg-blue/80" : "bg-purple/80"}`}
                      style={{ height: `${barHeight}px` }}
                    >
                      <span className="text-lg font-bold text-midnight">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-white-muted">
              Aún no hay jugadores en el ranking.
            </p>
          )}
        </section>

        <Footer/>
        
      </div>
    </div>
  );
};

export default Home;
