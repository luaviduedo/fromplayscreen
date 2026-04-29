"use client";

import { useMemo, useState } from "react";

type Movie = {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseDate: string;
  voteAverage: number;
};

type SourceGame = {
  appId: number;
  name: string;
  genres: string[];
  categories: string[];
  tags: string[];
  weight: number;
};

type Signals = {
  movieThemes: string[];
  movieGenres: string[];
  searchTerms: string[];
  keywordCandidates: string[];
};

type RecommendationResponse = {
  success: boolean;
  data?: {
    sourceType: string;
    recommendations: Movie[];
    profile: {
      sourceGames: SourceGame[];
      topTags: string[];
      topGenres: string[];
      topCategories: string[];
    };
    signals: Signals;
  };
  error?: {
    code: string;
    message: string;
  };
};

type CustomRecommendationResponse = {
  success: boolean;
  data?: {
    movieThemes: string[];
    movieGenres: string[];
    searchTerms: string[];
    keywordCandidates: string[];
    recommendations: Movie[];
  };
  error?: {
    code: string;
    message: string;
  };
};

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm leading-6 text-zinc-400">{subtitle}</p>
        ) : null}
      </div>

      {children}
    </section>
  );
}

function Chip({
  children,
  variant = "default",
  onClick,
}: {
  children: React.ReactNode;
  variant?: "default" | "danger" | "soft";
  onClick?: () => void;
}) {
  const style =
    variant === "danger"
      ? "border-red-400/20 bg-red-500/10 text-red-100 hover:border-red-300/40 hover:bg-red-500/15"
      : variant === "soft"
        ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
        : "border-white/10 bg-black/25 text-zinc-200 hover:border-white/20 hover:bg-white/10";

  const Comp = onClick ? "button" : "span";

  return (
    <Comp
      {...(onClick ? { type: "button", onClick } : {})}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${style}`}
    >
      {children}
    </Comp>
  );
}

function LabelGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
        {title}
      </h3>

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Chip key={item}>{item}</Chip>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">Nenhum dado disponível.</p>
      )}
    </div>
  );
}

function SignalEditor({
  title,
  type,
  items,
  onRemove,
}: {
  title: string;
  type: keyof Signals;
  items: string[];
  onRemove: (type: keyof Signals, value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
        {title}
      </h3>

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Chip
              key={`${type}-${item}`}
              variant="danger"
              onClick={() => onRemove(type, item)}
            >
              {item} ×
            </Chip>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">Nenhum sinal restante.</p>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function MovieCard({ movie }: { movie: Movie }) {
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null;

  return (
    <article className="group overflow-hidden rounded-[26px] border border-white/10 bg-black/25 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20">
      <div className="relative">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="h-[390px] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-[390px] w-full items-center justify-center bg-black/30 text-sm text-zinc-500">
            Sem pôster
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold leading-6 text-white">
            {movie.title}
          </h3>

          <div className="shrink-0 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 text-xs font-medium text-yellow-200">
            {movie.voteAverage.toFixed(1)}
          </div>
        </div>

        <p className="text-sm text-zinc-400">{movie.releaseDate || "N/A"}</p>

        <p className="line-clamp-6 text-sm leading-6 text-zinc-300">
          {movie.overview || "Sem descrição disponível."}
        </p>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [steamId, setSteamId] = useState("76561198283484549");
  const [mode, setMode] = useState<"recent" | "top-played">("top-played");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [selectedSignals, setSelectedSignals] = useState<Signals | null>(null);

  const totalSignals = useMemo(() => {
    if (!selectedSignals) return 0;

    return (
      selectedSignals.movieThemes.length +
      selectedSignals.movieGenres.length +
      selectedSignals.searchTerms.length +
      selectedSignals.keywordCandidates.length
    );
  }, [selectedSignals]);

  async function handleSearch() {
    setLoading(true);
    setResult(null);
    setSelectedSignals(null);

    try {
      const response = await fetch(
        `/api/recommend/${mode}?steamId=${encodeURIComponent(steamId)}`,
      );

      const data = (await response.json()) as RecommendationResponse;
      setResult(data);

      if (data.success && data.data) {
        setSelectedSignals(data.data.signals);
      }
    } catch {
      setResult({
        success: false,
        error: {
          code: "REQUEST_FAILED",
          message: "Não foi possível buscar as recomendações.",
        },
      });
    } finally {
      setLoading(false);
    }
  }

  function removeSignal(type: keyof Signals, value: string) {
    setSelectedSignals((prev) => {
      if (!prev) return prev;

      const next: Signals = {
        ...prev,
        [type]: prev[type].filter((item) => item !== value),
      };

      if (type === "movieThemes") {
        const lowerValue = value.toLowerCase();

        next.searchTerms = next.searchTerms.filter(
          (term) => !term.toLowerCase().includes(lowerValue),
        );

        next.keywordCandidates = next.keywordCandidates.filter(
          (keyword) => keyword.toLowerCase() !== lowerValue,
        );
      }

      if (type === "keywordCandidates") {
        const lowerValue = value.toLowerCase();

        next.searchTerms = next.searchTerms.filter(
          (term) => !term.toLowerCase().includes(lowerValue),
        );
      }

      return next;
    });
  }

  async function handleApplySignals() {
    if (!selectedSignals) return;

    setLoading(true);

    try {
      const response = await fetch("/api/recommend/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedSignals),
      });

      const data = (await response.json()) as CustomRecommendationResponse;

      if (!response.ok || !data.success || !data.data) {
        setResult((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            success: false,
            error: data.error ?? {
              code: "CUSTOM_RECOMMEND_FAILED",
              message: "Não foi possível atualizar as recomendações.",
            },
          };
        });

        return;
      }

      const customData = data.data;

      setResult((prev) => {
        if (!prev || !prev.data) return prev;

        return {
          ...prev,
          success: true,
          error: undefined,
          data: {
            ...prev.data,
            signals: {
              movieThemes: customData.movieThemes,
              movieGenres: customData.movieGenres,
              searchTerms: customData.searchTerms,
              keywordCandidates: customData.keywordCandidates,
            },
            recommendations: customData.recommendations,
          },
        };
      });

      setSelectedSignals({
        movieThemes: customData.movieThemes,
        movieGenres: customData.movieGenres,
        searchTerms: customData.searchTerms,
        keywordCandidates: customData.keywordCandidates,
      });
    } catch (error) {
      console.error("Erro ao atualizar recomendações:", error);

      setResult((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          success: false,
          error: {
            code: "CUSTOM_REQUEST_FAILED",
            message: "Não foi possível atualizar as recomendações.",
          },
        };
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-[-10%] h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[8%] h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[18%] h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%)]" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
        <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl md:p-8">
          <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200">
                Steam → TMDb
              </div>

              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
                FromPlayScreen
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300 md:text-lg">
                Descubra filmes com base nos seus jogos da Steam usando temas
                específicos, tags reais dos jogos e sinais ajustáveis como{" "}
                <span className="text-white">cyberpunk</span>,{" "}
                <span className="text-white">dinosaurs</span>,{" "}
                <span className="text-white">medieval</span> e{" "}
                <span className="text-white">samurai</span>.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <StatCard
                  label="Modo"
                  value={mode === "recent" ? "Recentes" : "Mais jogados"}
                />
                <StatCard
                  label="Filmes"
                  value={result?.data?.recommendations.length ?? 0}
                />
                <StatCard label="Sinais ativos" value={totalSignals} />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/30 p-4 shadow-2xl md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-300">
                  Buscar recomendações
                </p>
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Steam ID
                  </label>
                  <input
                    value={steamId}
                    onChange={(e) => setSteamId(e.target.value)}
                    placeholder="Digite seu Steam ID"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-400/40 focus:bg-white/[0.06]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Fonte
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMode("top-played")}
                      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        mode === "top-played"
                          ? "border-cyan-400/40 bg-cyan-400/15 text-white"
                          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.07]"
                      }`}
                    >
                      Mais jogados
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode("recent")}
                      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        mode === "recent"
                          ? "border-cyan-400/40 bg-cyan-400/15 text-white"
                          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.07]"
                      }`}
                    >
                      Recentes
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full rounded-2xl bg-white px-5 py-3.5 font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Buscando..." : "Buscar recomendações"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {result?.error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5 text-red-100">
            <p className="font-medium">Algo deu errado</p>
            <p className="mt-1 text-sm text-red-200/90">
              {result.error.message}
            </p>
          </div>
        ) : null}

        {result?.success && result.data ? (
          <div className="grid gap-8">
            <SectionCard
              title="Perfil detectado"
              subtitle="Resumo dos sinais principais encontrados no seu perfil."
            >
              <div className="grid gap-4 lg:grid-cols-3">
                <LabelGroup
                  title="Top Tags"
                  items={result.data.profile.topTags}
                />
                <LabelGroup
                  title="Top Gêneros"
                  items={result.data.profile.topGenres}
                />
                <LabelGroup
                  title="Temas de Filme"
                  items={result.data.signals.movieThemes}
                />
              </div>
            </SectionCard>

            {selectedSignals ? (
              <SectionCard
                title="Editor de sinais"
                subtitle="Remova sinais que não fazem sentido para refinar o resultado."
              >
                <div className="grid gap-4 xl:grid-cols-2">
                  <SignalEditor
                    title="Temas"
                    type="movieThemes"
                    items={selectedSignals.movieThemes}
                    onRemove={removeSignal}
                  />
                  <SignalEditor
                    title="Gêneros TMDb"
                    type="movieGenres"
                    items={selectedSignals.movieGenres}
                    onRemove={removeSignal}
                  />
                  <SignalEditor
                    title="Termos de busca"
                    type="searchTerms"
                    items={selectedSignals.searchTerms}
                    onRemove={removeSignal}
                  />
                  <SignalEditor
                    title="Keywords"
                    type="keywordCandidates"
                    items={selectedSignals.keywordCandidates}
                    onRemove={removeSignal}
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-zinc-400">
                    Sinais ativos:{" "}
                    <span className="font-medium text-white">
                      {totalSignals}
                    </span>
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      void handleApplySignals();
                    }}
                    disabled={loading || !selectedSignals}
                    className="rounded-2xl border border-white/10 bg-white px-5 py-3 font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Atualizando..." : "Atualizar recomendações"}
                  </button>
                </div>
              </SectionCard>
            ) : null}

            <SectionCard
              title="Jogos analisados"
              subtitle="As tags reais dos jogos também entram no processo de busca."
            >
              {result.data.profile.sourceGames.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {result.data.profile.sourceGames.map((game) => (
                    <article
                      key={game.appId}
                      className="group rounded-[26px] border border-white/10 bg-black/25 p-5 transition hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-black/35"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {game.name}
                        </h3>
                        <Chip variant="soft">Peso {game.weight}</Chip>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div>
                          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                            Tags
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {game.tags.slice(0, 8).map((tag) => (
                              <Chip key={tag}>{tag}</Chip>
                            ))}
                          </div>
                        </div>

                        {game.genres.length > 0 ? (
                          <div>
                            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                              Gêneros
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {game.genres.slice(0, 4).map((genre) => (
                                <Chip key={genre}>{genre}</Chip>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400">
                  Nenhum jogo analisado foi encontrado.
                </p>
              )}
            </SectionCard>

            {result.data.recommendations.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-zinc-300">
                Nenhuma recomendação foi encontrada para este modo. Tente
                ajustar os sinais ou trocar a fonte.
              </div>
            ) : (
              <SectionCard
                title="Filmes recomendados"
                subtitle="Resultados priorizando temas e tags reais dos seus jogos."
              >
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {result.data.recommendations.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
