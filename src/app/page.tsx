"use client";

import { useState } from "react";

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
    recommendations: Movie[];
  };
  error?: {
    code: string;
    message: string;
  };
};

function LabelGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-zinc-400">{title}</h3>

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-sm"
            >
              {item}
            </span>
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
    <div>
      <h3 className="mb-2 text-sm font-semibold text-zinc-400">{title}</h3>

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onRemove(type, item)}
              className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-sm transition hover:border-red-400/40 hover:bg-red-500/10"
            >
              {item} ×
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">Nenhum sinal restante.</p>
      )}
    </div>
  );
}

export default function HomePage() {
  const [steamId, setSteamId] = useState("76561198283484549");
  const [mode, setMode] = useState<"recent" | "top-played">("top-played");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [selectedSignals, setSelectedSignals] = useState<Signals | null>(null);

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
        next.searchTerms = next.searchTerms.filter(
          (term) => !term.toLowerCase().includes(value.toLowerCase()),
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
            },
            recommendations: customData.recommendations,
          },
        };
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
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">PlayFlix</h1>
          <p className="mt-2 text-zinc-400">
            Descubra filmes com base nos seus jogos da Steam.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
            <input
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              placeholder="Digite seu Steam ID"
              className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
            />

            <select
              value={mode}
              onChange={(e) =>
                setMode(e.target.value as "recent" | "top-played")
              }
              className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
            >
              <option value="top-played">Mais jogados</option>
              <option value="recent">Recentes</option>
            </select>

            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="rounded-xl bg-white px-5 py-3 font-semibold text-black disabled:opacity-50"
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </div>

        {result?.error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {result.error.message}
          </div>
        )}

        {result?.success && result.data && (
          <div className="mt-8 space-y-8">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold">Perfil detectado</h2>

              <div className="mt-4 grid gap-6 md:grid-cols-3">
                <LabelGroup
                  title="Top Tags"
                  items={result.data.profile.topTags}
                />
                <LabelGroup
                  title="Top Gêneros"
                  items={result.data.profile.topGenres}
                />
                <LabelGroup
                  title="Sinais de Filme"
                  items={result.data.signals.movieThemes}
                />
              </div>
            </section>

            {selectedSignals && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-xl font-semibold">
                  Editar sinais de filme
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Remova os sinais que não fazem sentido para refinar as
                  recomendações.
                </p>

                <div className="mt-5 space-y-5">
                  <SignalEditor
                    title="Temas"
                    type="movieThemes"
                    items={selectedSignals.movieThemes}
                    onRemove={removeSignal}
                  />

                  <SignalEditor
                    title="Gêneros"
                    type="movieGenres"
                    items={selectedSignals.movieGenres}
                    onRemove={removeSignal}
                  />

                  <SignalEditor
                    title="Buscas"
                    type="searchTerms"
                    items={selectedSignals.searchTerms}
                    onRemove={removeSignal}
                  />
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      console.log(
                        "Atualizando recomendações com sinais:",
                        selectedSignals,
                      );
                      void handleApplySignals();
                    }}
                    disabled={loading || !selectedSignals}
                    className="rounded-xl bg-white px-5 py-3 font-semibold text-black disabled:opacity-50"
                  >
                    {loading ? "Atualizando..." : "Atualizar recomendações"}
                  </button>
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold">Jogos analisados</h2>

              {result.data.profile.sourceGames.length > 0 ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {result.data.profile.sourceGames.map((game) => (
                    <div
                      key={game.appId}
                      className="rounded-xl border border-white/10 bg-black/30 p-4"
                    >
                      <h3 className="font-semibold">{game.name}</h3>
                      <p className="mt-2 text-sm text-zinc-400">
                        Peso: {game.weight}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {game.tags.slice(0, 8).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-zinc-400">
                  Nenhum jogo analisado foi encontrado.
                </p>
              )}
            </section>

            {result.data.recommendations.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-zinc-300">
                Nenhuma recomendação foi encontrada para este modo. Tente usar
                “Mais jogados”.
              </div>
            ) : (
              <section>
                <h2 className="mb-4 text-2xl font-semibold">
                  Filmes recomendados
                </h2>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {result.data.recommendations.map((movie) => {
                    const posterUrl = movie.posterPath
                      ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
                      : null;

                    return (
                      <article
                        key={movie.id}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        {posterUrl ? (
                          <img
                            src={posterUrl}
                            alt={movie.title}
                            className="mb-4 h-[420px] w-full rounded-xl object-cover"
                          />
                        ) : (
                          <div className="mb-4 flex h-[420px] w-full items-center justify-center rounded-xl bg-black/30 text-sm text-zinc-500">
                            Sem pôster
                          </div>
                        )}

                        <h3 className="text-lg font-semibold">{movie.title}</h3>

                        <div className="mt-2 text-sm text-zinc-400">
                          <p>Nota: {movie.voteAverage.toFixed(1)}</p>
                          <p>Lançamento: {movie.releaseDate || "N/A"}</p>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-zinc-300">
                          {movie.overview || "Sem descrição disponível."}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
