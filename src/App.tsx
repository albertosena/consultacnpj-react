import React, { useState } from "react";
import Papa from "papaparse";

type CnaeSecundario = {
  codigo: number;
  descricao: string;
};

type CnpjData = {
  uf: string;
  cep: string;
  qsa: any[];
  cnpj: string;
  pais: string | null;
  email: string | null;
  porte: string;
  bairro: string;
  numero: string;
  ddd_fax: string;
  municipio: string;
  logradouro: string;
  cnae_fiscal: number;
  codigo_pais: number | null;
  complemento: string;
  codigo_porte: number;
  razao_social: string;
  nome_fantasia: string;
  capital_social: number;
  ddd_telefone_1: string;
  ddd_telefone_2: string;
  opcao_pelo_mei: boolean;
  codigo_municipio: number;
  cnaes_secundarios: CnaeSecundario[];
  natureza_juridica: string;
  regime_tributario: string[];
  situacao_especial: string;
  opcao_pelo_simples: boolean;
  situacao_cadastral: number;
  data_opcao_pelo_mei: string | null;
  data_exclusao_do_mei: string | null;
  cnae_fiscal_descricao: string;
  codigo_municipio_ibge: number;
  data_inicio_atividade: string;
  data_situacao_especial: string | null;
  data_opcao_pelo_simples: string | null;
  data_situacao_cadastral: string;
  nome_cidade_no_exterior: string;
  codigo_natureza_juridica: number;
  data_exclusao_do_simples: string | null;
  motivo_situacao_cadastral: number;
  ente_federativo_responsavel: string;
  identificador_matriz_filial: number;
  qualificacao_do_responsavel: number;
  descricao_situacao_cadastral: string;
  descricao_tipo_de_logradouro: string;
  descricao_motivo_situacao_cadastral: string;
  descricao_identificador_matriz_filial: string;
};

// Campos que o usuário pode escolher para enriquecer o CSV
const ENRICH_FIELDS = [
  { key: "razao_social", label: "Razão social" },
  { key: "nome_fantasia", label: "Nome fantasia" },
  { key: "municipio", label: "Município" },
  { key: "uf", label: "UF" },
  { key: "cnae_fiscal", label: "CNAE fiscal" },
  { key: "cnae_fiscal_descricao", label: "Descrição CNAE" },
  { key: "descricao_situacao_cadastral", label: "Situação cadastral" },
  { key: "data_inicio_atividade", label: "Data início atividade" },
  { key: "opcao_pelo_simples", label: "Simples Nacional" },
  { key: "opcao_pelo_mei", label: "MEI" },
  { key: "capital_social", label: "Capital social" },
];

function formatCnpj(cnpj: string | undefined) {
  if (!cnpj) return "";
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
    5,
    8
  )}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

function buildAddress(data: CnpjData) {
  const parts = [
    `${data.descricao_tipo_de_logradouro} ${data.logradouro}`.trim(),
    data.numero && data.numero !== "0" ? `Nº ${data.numero}` : "",
    data.complemento,
    data.bairro,
    `${data.municipio} - ${data.uf}`,
    data.cep && data.cep.length === 8
      ? `${data.cep.slice(0, 5)}-${data.cep.slice(5)}`
      : data.cep,
  ].filter(Boolean);
  return parts.join(", ");
}

const App: React.FC = () => {
  // --- Consulta individual de CNPJ ---
  const [cnpjInput, setCnpjInput] = useState("");
  const [data, setData] = useState<CnpjData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const numericCnpj = cnpjInput.replace(/\D/g, "");
  const isValidCnpjLength = numericCnpj.length === 14;

  // --- CSV em lote ---
  // 🔽 Campos dinâmicos da API
  const [allFields, setAllFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filterSearch, setFilterSearch] = useState("");

  // 🔽 Atualiza lista de campos automaticamente com base no último JSON da API
  React.useEffect(() => {
    async function fetchSampleCnpj() {
      try {
        const resp = await fetch("https://minhareceita.org/49752997000125");
        const json = await resp.json();
        const keys = Object.keys(json).sort();
        setAllFields(keys);
        setSelectedFields(keys); // marca todos por padrão
      } catch (e) {
        console.error("Erro ao obter campos de exemplo:", e);
      }
    }
    fetchSampleCnpj();
  }, []);


  // 🔽 Atualiza lista de campos automaticamente com base no último JSON da API
  React.useEffect(() => {
    async function fetchSampleCnpj() {
      try {
        const resp = await fetch("https://minhareceita.org/49752997000125");
        const json = await resp.json();
        const keys = Object.keys(json).sort();
        setAllFields(keys);
        setSelectedFields(keys); // marca todos por padrão
      } catch (e) {
        console.error("Erro ao obter campos de exemplo:", e);
      }
    }
    fetchSampleCnpj();
  }, []);

  // 🔽 Filtro de busca
  const filteredFields = allFields.filter((key) =>
    key.toLowerCase().includes(filterSearch)
  );

  const [csvStatus, setCsvStatus] = useState<
    "idle" | "parsing" | "enriching" | "done" | "error"
  >("idle");
  const [csvMessage, setCsvMessage] = useState<string | null>(null);
  const [csvProgress, setCsvProgress] = useState<number>(0);
  const [csvDownloadUrl, setCsvDownloadUrl] = useState<string | null>(null);
  const [csvFileName, setCsvFileName] = useState<string>(
    "cnpjs-enriquecidos.csv"
  );
  const [csvProcessing, setCsvProcessing] = useState(false);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setData(null);

    if (!isValidCnpjLength) {
      setError("Digite um CNPJ com 14 dígitos.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://minhareceita.org/${numericCnpj}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Erro ao buscar dados (HTTP ${response.status}). Verifique o CNPJ.`
        );
      }

      const json = (await response.json()) as CnpjData;
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ||
        "Não foi possível buscar os dados. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChangeInput(value: string) {
    const cleaned = value.replace(/[^\d./\- ]/g, "");
    setCnpjInput(cleaned);
  }

  function toggleField(key: string) {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function handleCsvUpload(file: File) {
    setCsvStatus("parsing");
    setCsvMessage(null);
    setCsvProgress(0);
    setCsvProcessing(true);
    if (csvDownloadUrl) {
      URL.revokeObjectURL(csvDownloadUrl);
      setCsvDownloadUrl(null);
    }

    try {
      const text = await file.text();

      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors && parsed.errors.length > 0) {
        console.error(parsed.errors);
        throw new Error(
          "Erro ao ler o CSV. Verifique se o arquivo está bem formatado."
        );
      }

      const rows = parsed.data;

      if (!rows.length) {
        throw new Error("O arquivo CSV está vazio.");
      }

      if (!("cnpj" in rows[0])) {
        throw new Error(
          "Não encontrei a coluna 'cnpj' no cabeçalho do CSV. Certifique-se de que existe uma coluna com o nome exato 'cnpj'."
        );
      }

      setCsvStatus("enriching");
      setCsvMessage("Consultando API para cada CNPJ...");
      const total = rows.length;
      const enrichedRows: Record<string, any>[] = [];

      let processed = 0;

      // Processa cada linha de forma sequencial (pode ser paralelizado depois)
      for (const row of rows) {
        const rawCnpj = (row["cnpj"] || "").toString();
        const numeric = rawCnpj.replace(/\D/g, "");

        let apiData: CnpjData | null = null;

        if (numeric.length === 14) {
          try {
            const resp = await fetch(
              `https://minhareceita.org/${numeric}`,
              {
                headers: { Accept: "application/json" },
              }
            );
            if (resp.ok) {
              apiData = (await resp.json()) as CnpjData;
            }
          } catch (e) {
            console.error("Erro ao consultar CNPJ", numeric, e);
          }
        }

        const outRow: Record<string, any> = { ...row };

        if (apiData) {
          ENRICH_FIELDS.forEach((field) => {
            if (selectedFields.includes(field.key)) {
              let value: any = (apiData as any)[field.key];

              if (field.key === "capital_social" && typeof value === "number") {
                // pode ajustar o formato se quiser
                value = value.toString().replace(".", ",");
              }

              if (
                (field.key === "opcao_pelo_simples" ||
                  field.key === "opcao_pelo_mei") &&
                typeof value === "boolean"
              ) {
                value = value ? "Sim" : "Não";
              }

              if (field.key === "data_inicio_atividade" && typeof value === "string") {
                value = formatDate(value);
              }

              outRow[field.key] = value ?? "";
            }
          });
        }

        enrichedRows.push(outRow);
        processed++;
        setCsvProgress(processed / total);
      }

      const outputCsv = Papa.unparse(enrichedRows);
      const blob = new Blob([outputCsv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);

      setCsvDownloadUrl(url);
      setCsvFileName(
        file.name.toLowerCase().endsWith(".csv")
          ? file.name.replace(/\.csv$/i, "-enriquecido.csv")
          : file.name + "-enriquecido.csv"
      );
      setCsvStatus("done");
      setCsvMessage(
        `Processamento concluído. ${enrichedRows.length} linhas enriquecidas.`
      );
    } catch (err: any) {
      console.error(err);
      setCsvStatus("error");
      setCsvMessage(
        err?.message ||
        "Ocorreu um erro ao processar o CSV. Verifique o arquivo e tente novamente."
      );
    } finally {
      setCsvProcessing(false);
    }
  }

  function handleCsvInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    void handleCsvUpload(file);
    // limpa o input para permitir subir o mesmo arquivo de novo depois
    e.target.value = "";
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl space-y-6">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Consulta de CNPJ
          </h1>
          <p className="mt-2 text-slate-400">
            Consulte dados de CNPJ individualmente ou faça upload de um{" "}
            <span className="font-medium text-sky-400">arquivo CSV</span> com
            vários CNPJs.
          </p>
        </header>

        {/* Seção 1 - Consulta única */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl shadow-slate-950/40 backdrop-blur">
          <h2 className="text-lg font-semibold mb-3">
            🔍 Consulta individual
          </h2>
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-3 md:items-end"
          >
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                CNPJ
              </label>
              <input
                type="text"
                value={cnpjInput}
                onChange={(e) => handleChangeInput(e.target.value)}
                placeholder="00.000.000/0000-00"
                className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2.5 text-sm md:text-base outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition"
              />
              <p className="mt-1 text-xs text-slate-500">
                Você pode digitar só os números ou já formatado. São 14
                dígitos.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !isValidCnpjLength}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm md:text-base font-medium bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition shadow-lg shadow-sky-500/30"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 border-2 border-slate-200 border-t-transparent rounded-full animate-spin" />
                  Buscando...
                </>
              ) : (
                <>Consultar</>
              )}
            </button>
          </form>

          {!isValidCnpjLength && numericCnpj.length > 0 && (
            <p className="mt-2 text-xs text-amber-400">
              O CNPJ precisa ter exatamente 14 dígitos (atualmente tem{" "}
              {numericCnpj.length}).
            </p>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-rose-500/60 bg-rose-950/60 px-3 py-2.5 text-sm text-rose-100">
              ⚠️ {error}
            </div>
          )}

          {data && (
            <div className="mt-6 space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-lg shadow-slate-950/40">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-6">
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold">
                      {data.razao_social || "Razão social não informada"}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {data.nome_fantasia || "Sem nome fantasia"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      CNPJ:{" "}
                      <span className="font-mono">
                        {formatCnpj(data.cnpj || numericCnpj)}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-1 text-sm">
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/40">
                      {data.descricao_situacao_cadastral}
                    </span>
                    <span className="text-xs text-slate-400">
                      Início: {formatDate(data.data_inicio_atividade)}
                    </span>
                    <span className="text-xs text-slate-400">
                      Última situação: {formatDate(data.data_situacao_cadastral)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 text-sm">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Endereço
                    </h4>
                    <p className="text-slate-200">{buildAddress(data)}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Contato
                    </h4>
                    <p>
                      <span className="text-slate-400">Telefone 1: </span>
                      {data.ddd_telefone_1
                        ? `(${data.ddd_telefone_1.slice(
                          0,
                          2
                        )}) ${data.ddd_telefone_1.slice(2)}`
                        : "-"}
                    </p>
                    <p>
                      <span className="text-slate-400">Telefone 2: </span>
                      {data.ddd_telefone_2 || "-"}
                    </p>
                    <p>
                      <span className="text-slate-400">E-mail: </span>
                      {data.email || "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Porte / Regime
                    </h4>
                    <p>Porte: {data.porte}</p>
                    <p>
                      Simples: {data.opcao_pelo_simples ? "Sim ✅" : "Não ❌"}
                    </p>
                    <p>MEI: {data.opcao_pelo_mei ? "Sim ✅" : "Não ❌"}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Atividade Principal
                    </h4>
                    <p className="font-mono text-xs text-slate-300">
                      {data.cnae_fiscal}
                    </p>
                    <p>{data.cnae_fiscal_descricao}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Capital Social
                    </h4>
                    <p>
                      R{"$ "}
                      {data.capital_social.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                {data.cnaes_secundarios &&
                  data.cnaes_secundarios.length > 0 &&
                  (data.cnaes_secundarios[0].codigo !== 0 ||
                    data.cnaes_secundarios[0].descricao) && (
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                        Atividades Secundárias
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {data.cnaes_secundarios.map((cnae, idx) => (
                          <li
                            key={idx}
                            className="flex gap-2 text-slate-200 text-xs md:text-sm"
                          >
                            <span className="font-mono text-slate-400">
                              {cnae.codigo}
                            </span>
                            <span>{cnae.descricao}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mt-3">
                <button
                  type="button"
                  onClick={() => setShowRaw((s) => !s)}
                  className="text-xs inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-600 hover:border-sky-400 hover:text-sky-300 transition"
                >
                  {showRaw ? "Esconder JSON bruto" : "Mostrar JSON bruto"}
                  <span className="text-slate-500">
                    {showRaw ? "▲" : "▼"}
                  </span>
                </button>

                {showRaw && (
                  <pre className="mt-3 max-h-72 overflow-auto text-xs bg-slate-950/90 rounded-xl p-3 border border-slate-800">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Seção 2 - CSV em lote */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl shadow-slate-950/40 backdrop-blur">
          <h2 className="text-lg font-semibold mb-3">
            🧾 Processar CSV de CNPJs
          </h2>

          <p className="text-sm text-slate-400 mb-3">
            Envie um arquivo CSV com uma coluna chamada{" "}
            <code className="font-mono text-sky-300">cnpj</code>. Vamos consultar a
            API para cada CNPJ e gerar um novo CSV com os campos que você
            escolher abaixo.
          </p>

          {/* 🔽 Filtro de campos (dinâmico, todos os campos do JSON) */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Campos para enriquecer o CSV
            </h3>

            {/* Campo de busca */}
            <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <input
                type="text"
                placeholder="Filtrar campos (ex: razao, municipio...)"
                className="input sm:max-w-xs"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value.toLowerCase())}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-xs px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white"
                  onClick={() => setSelectedFields(allFields)}
                >
                  Marcar todos
                </button>
                <button
                  type="button"
                  className="text-xs px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white"
                  onClick={() => setSelectedFields([])}
                >
                  Limpar todos
                </button>
              </div>
            </div>

            {/* Lista de checkboxes */}
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 text-sm max-h-72 overflow-auto border border-slate-800 rounded-xl p-3">
              {filteredFields.length > 0 ? (
                filteredFields.map((key) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-slate-200 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-slate-600 bg-slate-950 text-sky-500"
                      checked={selectedFields.includes(key)}
                      onChange={() => toggleField(key)}
                    />
                    <span>{key}</span>
                  </label>
                ))
              ) : (
                <p className="text-xs text-slate-500 col-span-full">
                  Nenhum campo encontrado com esse filtro.
                </p>
              )}
            </div>

            {selectedFields.length === 0 && (
              <p className="mt-1 text-xs text-amber-400">
                Nenhum campo selecionado — o CSV de saída terá apenas as colunas originais.
              </p>
            )}
          </div>


          {/* Upload do CSV */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-200">Arquivo CSV</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleCsvInputChange}
                disabled={csvProcessing}
                className="block w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-sky-500 file:text-white hover:file:bg-sky-400 cursor-pointer bg-slate-950/60 border border-slate-700 rounded-xl px-2 py-1.5"
              />
              <span className="text-xs text-slate-500">
                Certifique-se de que o cabeçalho contém uma coluna{" "}
                <code className="font-mono text-sky-300">cnpj</code>.
              </span>
            </label>

            <div className="flex flex-col items-start md:items-end gap-2 text-xs text-slate-400">
              {csvStatus === "enriching" && (
                <div className="flex flex-col gap-1 w-full max-w-xs">
                  <span>Processando registros...</span>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-sky-500 transition-all"
                      style={{ width: `${Math.round(csvProgress * 100)}%` }}
                    />
                  </div>
                  <span>{Math.round(csvProgress * 100)}%</span>
                </div>
              )}

              {csvDownloadUrl && csvStatus === "done" && (
                <a
                  href={csvDownloadUrl}
                  download={csvFileName}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-xs font-medium text-slate-950 shadow-md shadow-emerald-500/40"
                >
                  ⬇️ Baixar CSV enriquecido
                </a>
              )}
            </div>
          </div>

          {csvMessage && (
            <div
              className={`mt-3 rounded-xl px-3 py-2 text-xs ${csvStatus === "error"
                ? "bg-rose-950/60 border border-rose-500/60 text-rose-100"
                : "bg-slate-950/60 border border-slate-700 text-slate-100"
                }`}
            >
              {csvMessage}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default App;
