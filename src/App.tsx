import React, { useState, useEffect, useId } from "react";
import Papa from "papaparse";
import {
  Search,
  FileSpreadsheet,
  Building2,
  MapPin,
  Phone,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Download,
  UploadCloud,
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Filter,
  ShieldCheck,
  Briefcase,
  X,
} from "lucide-react";

type CnaeSecundario = {
  codigo: number;
  descricao: string;
};

type SocioQsa = {
  pais?: string | null;
  nome_socio?: string;
  codigo_pais?: number | null;
  faixa_etaria?: string;
  cnpj_cpf_do_socio?: string;
  qualificacao_socio?: string;
  codigo_faixa_etaria?: number;
  data_entrada_sociedade?: string;
  identificador_de_socio?: number;
  cpf_representante_legal?: string;
  nome_representante_legal?: string;
  codigo_qualificacao_socio?: number;
  qualificacao_representante_legal?: string;
  codigo_qualificacao_representante_legal?: number;
};

type CnpjData = {
  uf: string;
  cep: string;
  qsa: SocioQsa[];
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
  regime_tributario: any[];
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

// Lista completa de todos os 48 campos retornados pela API de CNPJ
const ALL_KNOWN_FIELDS: string[] = [
  "cnpj",
  "identificador_matriz_filial",
  "descricao_identificador_matriz_filial",
  "razao_social",
  "nome_fantasia",
  "situacao_cadastral",
  "descricao_situacao_cadastral",
  "data_situacao_cadastral",
  "motivo_situacao_cadastral",
  "descricao_motivo_situacao_cadastral",
  "nome_cidade_no_exterior",
  "codigo_pais",
  "pais",
  "data_inicio_atividade",
  "cnae_fiscal",
  "cnae_fiscal_descricao",
  "descricao_tipo_de_logradouro",
  "logradouro",
  "numero",
  "complemento",
  "bairro",
  "cep",
  "uf",
  "codigo_municipio",
  "codigo_municipio_ibge",
  "municipio",
  "ddd_telefone_1",
  "ddd_telefone_2",
  "ddd_fax",
  "email",
  "situacao_especial",
  "data_situacao_especial",
  "opcao_pelo_simples",
  "data_opcao_pelo_simples",
  "data_exclusao_do_simples",
  "opcao_pelo_mei",
  "data_opcao_pelo_mei",
  "data_exclusao_do_mei",
  "capital_social",
  "porte",
  "codigo_porte",
  "natureza_juridica",
  "codigo_natureza_juridica",
  "qualificacao_do_responsavel",
  "ente_federativo_responsavel",
  "regime_tributario",
  "cnaes_secundarios",
  "qsa",
];

const PRESETS = {
  all: {
    label: "Todos (48)",
    fields: ALL_KNOWN_FIELDS,
  },
  recommended: {
    label: "Recomendados (16)",
    fields: [
      "cnpj",
      "razao_social",
      "nome_fantasia",
      "descricao_situacao_cadastral",
      "data_inicio_atividade",
      "cnae_fiscal",
      "cnae_fiscal_descricao",
      "natureza_juridica",
      "porte",
      "capital_social",
      "opcao_pelo_simples",
      "opcao_pelo_mei",
      "municipio",
      "uf",
      "ddd_telefone_1",
      "email",
    ],
  },
  contact: {
    label: "Endereço & Contato",
    fields: [
      "cnpj",
      "razao_social",
      "descricao_tipo_de_logradouro",
      "logradouro",
      "numero",
      "complemento",
      "bairro",
      "municipio",
      "uf",
      "cep",
      "ddd_telefone_1",
      "ddd_telefone_2",
      "email",
    ],
  },
  fiscal: {
    label: "Sócios & Regime",
    fields: [
      "cnpj",
      "razao_social",
      "cnae_fiscal",
      "cnae_fiscal_descricao",
      "cnaes_secundarios",
      "qsa",
      "capital_social",
      "opcao_pelo_simples",
      "data_opcao_pelo_simples",
      "opcao_pelo_mei",
      "natureza_juridica",
    ],
  },
};

const EXAMPLE_CNPJS = [
  { label: "3T Transportes", cnpj: "44.781.719/0001-82" },
  { label: "Petrobras", cnpj: "33.000.167/0001-01" },
  { label: "Banco do Brasil", cnpj: "00.000.000/0001-91" },
  { label: "Google Brasil", cnpj: "06.990.590/0001-23" },
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

function formatCurrency(val: number | undefined | null) {
  if (val === undefined || val === null) return "R$ 0,00";
  return val.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function buildAddress(data: CnpjData) {
  const parts = [
    `${data.descricao_tipo_de_logradouro || ""} ${data.logradouro || ""}`.trim(),
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
  const [activeTab, setActiveTab] = useState<"individual" | "batch">("individual");

  // --- Consulta individual de CNPJ ---
  const [cnpjInput, setCnpjInput] = useState("");
  const [data, setData] = useState<CnpjData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const numericCnpj = cnpjInput.replace(/\D/g, "");
  const isValidCnpjLength = numericCnpj.length === 14;

  // --- CSV em lote ---
  const [allFields, setAllFields] = useState<string[]>(ALL_KNOWN_FIELDS);
  const [selectedFields, setSelectedFields] = useState<string[]>(ALL_KNOWN_FIELDS);
  const [filterSearch, setFilterSearch] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Atualiza lista de campos automaticamente com base no JSON da API
  useEffect(() => {
    async function fetchSampleCnpj() {
      try {
        const resp = await fetch("https://minhareceita.org/44781719000182");
        if (resp.ok) {
          const json = await resp.json();
          const keys = Array.from(new Set([...ALL_KNOWN_FIELDS, ...Object.keys(json)])).sort();
          setAllFields(keys);
          setSelectedFields((prev) => {
            if (prev.length === ALL_KNOWN_FIELDS.length) {
              return keys;
            }
            return prev;
          });
        }
      } catch (e) {
        console.error("Erro ao obter campos de exemplo:", e);
      }
    }
    fetchSampleCnpj();
  }, []);

  const filteredFields = allFields.filter((key) =>
    key.toLowerCase().includes(filterSearch.toLowerCase())
  );

  const [csvStatus, setCsvStatus] = useState<
    "idle" | "parsing" | "enriching" | "done" | "error"
  >("idle");
  const [csvMessage, setCsvMessage] = useState<string | null>(null);
  const [csvProgress, setCsvProgress] = useState<number>(0);
  const [csvDownloadUrl, setCsvDownloadUrl] = useState<string | null>(null);
  const [csvFileName, setCsvFileName] = useState<string>("cnpjs-enriquecidos.csv");
  const [csvProcessing, setCsvProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([]);
  const [totalRowsCount, setTotalRowsCount] = useState<number>(0);
  const [fileToProcess, setFileToProcess] = useState<File | null>(null);

  function handleCopy(text: string, keyName: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  async function performSearch(cnpjToSearch: string) {
    const numeric = cnpjToSearch.replace(/\D/g, "");
    if (numeric.length !== 14) {
      setError("O CNPJ deve conter exatamente 14 dígitos.");
      return;
    }

    setError(null);
    setData(null);
    setLoading(true);

    try {
      const response = await fetch(`https://minhareceita.org/${numeric}`, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar dados (HTTP ${response.status}). Verifique o CNPJ.`);
      }

      const json = (await response.json()) as CnpjData;
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Não foi possível consultar os dados. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    performSearch(cnpjInput);
  }

  function handleQuickSelectCnpj(cnpj: string) {
    setCnpjInput(formatCnpj(cnpj));
    performSearch(cnpj);
  }

  function handleChangeInput(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 14) {
      if (digits.length > 2 && digits.length <= 14) {
        setCnpjInput(formatCnpj(digits));
      } else {
        setCnpjInput(digits);
      }
    }
  }

  function toggleField(key: string) {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function applyPreset(fields: string[]) {
    setSelectedFields(fields);
  }

  async function handleFileSelect(file: File) {
    setCsvStatus("idle");
    setCsvMessage(null);
    setCsvProgress(0);
    setPreviewData([]);
    setFileToProcess(null);
    if (csvDownloadUrl) {
      URL.revokeObjectURL(csvDownloadUrl);
      setCsvDownloadUrl(null);
    }

    try {
      const text = await file.text();
      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        preview: 5,
      });

      if (parsed.errors && parsed.errors.length > 0) {
        console.error(parsed.errors);
        throw new Error("Erro ao ler o CSV. Verifique se o arquivo está bem formatado.");
      }

      const rows = parsed.data;
      if (!rows.length) {
        throw new Error("O arquivo CSV está vazio.");
      }

      const cnpjHeader = Object.keys(rows[0]).find(
        (key) => key.trim().toLowerCase() === "cnpj"
      );

      if (!cnpjHeader) {
        throw new Error(
          "Não encontramos a coluna 'cnpj' no cabeçalho do CSV. Certifique-se de que existe uma coluna 'cnpj' ou 'CNPJ'."
        );
      }

      // Conta o total de linhas aproximado
      const allRows = Papa.parse(text, { header: true, skipEmptyLines: true });
      setTotalRowsCount(allRows.data.length);

      setPreviewData(rows);
      setFileToProcess(file);
      setCsvFileName(
        file.name.toLowerCase().endsWith(".csv")
          ? file.name.replace(/\.csv$/i, "-enriquecido.csv")
          : file.name + "-enriquecido.csv"
      );
    } catch (err: any) {
      console.error(err);
      setCsvStatus("error");
      setCsvMessage(
        err?.message || "Ocorreu um erro ao ler o arquivo. Verifique se é um CSV válido."
      );
    }
  }

  async function processCsv() {
    if (!fileToProcess) return;

    setCsvStatus("parsing");
    setCsvProcessing(true);
    setCsvMessage(null);

    try {
      const text = await fileToProcess.text();
      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
      });

      const rows = parsed.data;
      setCsvStatus("enriching");
      setCsvMessage("Consultando API e enriquecendo dados para cada CNPJ...");
      const total = rows.length;
      const enrichedRows: Record<string, any>[] = [];

      let processed = 0;

      for (const row of rows) {
        const cnpjKey = Object.keys(row).find(
          (k) => k.trim().toLowerCase() === "cnpj"
        );
        const rawCnpj = (cnpjKey ? row[cnpjKey] : row["cnpj"] || "").toString();
        const numeric = rawCnpj.replace(/\D/g, "");

        let apiData: Record<string, any> | null = null;

        if (numeric.length === 14) {
          try {
            const resp = await fetch(`https://minhareceita.org/${numeric}`, {
              headers: { Accept: "application/json" },
            });
            if (resp.ok) {
              apiData = (await resp.json()) as Record<string, any>;
            }
          } catch (e) {
            console.error("Erro ao consultar CNPJ", numeric, e);
          }
        }

        const outRow: Record<string, any> = { ...row };

        if (apiData) {
          selectedFields.forEach((fieldKey) => {
            const value = apiData[fieldKey];

            if (value === null || value === undefined) {
              outRow[fieldKey] = "";
            } else if (typeof value === "object") {
              outRow[fieldKey] = JSON.stringify(value);
            } else if (typeof value === "boolean") {
              outRow[fieldKey] = value ? "Sim" : "Não";
            } else if (fieldKey === "capital_social" && typeof value === "number") {
              outRow[fieldKey] = value.toString().replace(".", ",");
            } else if (fieldKey.startsWith("data_") && typeof value === "string") {
              outRow[fieldKey] = formatDate(value);
            } else {
              outRow[fieldKey] = value;
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
      setCsvStatus("done");
      setCsvMessage(`Processamento concluído com sucesso! ${enrichedRows.length} linhas enriquecidas.`);
    } catch (err: any) {
      console.error(err);
      setCsvStatus("error");
      setCsvMessage(
        err?.message || "Ocorreu um erro ao processar o CSV. Verifique o arquivo e tente novamente."
      );
    } finally {
      setCsvProcessing(false);
    }
  }

  function downloadSampleCsv() {
    const sample = "cnpj\n44.781.719/0001-82\n33.000.167/0001-01\n00.000.000/0001-91\n06.990.590/0001-23\n";
    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo-consulta-cnpjs.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCsvInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    void handleFileSelect(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
      void handleFileSelect(file);
    }
  }

  const fileInputId = useId();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-start px-4 py-8 md:py-12">
      <div className="w-full max-w-5xl space-y-8">
        {/* Header Hero */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dados Oficiais da Receita Federal em Tempo Real</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Consulta & Enriquecimento de CNPJ
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
            Consulte dados completos de qualquer empresa individualmente ou processe listas inteiras em CSV com 100% dos campos fiscais, cadastrais e societários.
          </p>
        </header>

        {/* Tab Navigation Pill */}
        <div className="flex p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-md mx-auto shadow-xl shadow-slate-950/40 backdrop-blur">
          <button
            type="button"
            onClick={() => setActiveTab("individual")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 ${
              activeTab === "individual"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Search className="w-4 h-4" />
            Consulta Individual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("batch")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 ${
              activeTab === "batch"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Processar CSV em Lote
          </button>
        </div>

        {/* TAB 1: CONSULTA INDIVIDUAL */}
        {activeTab === "individual" && (
          <div className="space-y-6 fade-in">
            {/* Search Box */}
            <div className="glass-card p-6 md:p-8">
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <label className="block text-sm font-medium text-slate-300">
                  Digite o CNPJ da empresa
                </label>

                <div className="relative flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={cnpjInput}
                      onChange={(e) => handleChangeInput(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-slate-950/80 border border-slate-700 text-base md:text-lg font-mono text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition"
                    />
                    {cnpjInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setCnpjInput("");
                          setData(null);
                          setError(null);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isValidCnpjLength}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition shadow-lg shadow-sky-500/25"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Buscando...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        <span>Consultar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Exemplos Rápidos */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-medium text-slate-400">Exemplos para testar:</span>
                  {EXAMPLE_CNPJS.map((ex) => (
                    <button
                      key={ex.cnpj}
                      type="button"
                      onClick={() => handleQuickSelectCnpj(ex.cnpj)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-sky-500/20 hover:text-sky-300 text-slate-300 border border-slate-700/60 transition"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </form>

              {/* Erro */}
              {error && (
                <div className="mt-4 flex items-center gap-3 p-4 rounded-xl border border-rose-500/40 bg-rose-950/40 text-rose-200 text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Resultado da Consulta Individual */}
            {data && (
              <div className="space-y-6 fade-in">
                {/* Header Principal da Empresa */}
                <div className="glass-card p-6 md:p-8 border-l-4 border-l-sky-500">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                          {data.razao_social || "Razão Social Não Informada"}
                        </h2>
                      </div>

                      <p className="text-base text-slate-400 font-medium">
                        {data.nome_fantasia || "Sem nome fantasia cadastrado"}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-mono border border-slate-700">
                          <span>CNPJ: {formatCnpj(data.cnpj || numericCnpj)}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(data.cnpj || numericCnpj, "cnpj")}
                            className="p-1 text-slate-400 hover:text-sky-400 transition"
                            title="Copiar CNPJ"
                          >
                            {copiedKey === "cnpj" ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                          {data.descricao_identificador_matriz_filial || "MATRIZ"}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border ${
                          data.descricao_situacao_cadastral === "ATIVA"
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                            : data.descricao_situacao_cadastral === "BAIXADA"
                            ? "bg-rose-500/15 text-rose-300 border-rose-500/40"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/40"
                        }`}
                      >
                        {data.descricao_situacao_cadastral === "ATIVA" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {data.descricao_situacao_cadastral || "SITUAÇÃO N/D"}
                      </span>

                      <div className="text-xs text-slate-400 flex flex-col md:items-end gap-0.5">
                        <span>Abertura: {formatDate(data.data_inicio_atividade)}</span>
                        <span>Atualização: {formatDate(data.data_situacao_cadastral)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid de 4 Cards de Detalhes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Card 1: Localização */}
                  <div className="glass-card p-5 md:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>Localização & Endereço</span>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          buildAddress(data)
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
                      >
                        <span>Ver no Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="text-sm space-y-2 text-slate-300">
                      <p className="font-medium text-white">{buildAddress(data)}</p>
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-400">
                        <div>
                          <span className="block text-slate-500">Bairro</span>
                          <span className="text-slate-200">{data.bairro || "-"}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500">CEP</span>
                          <span className="text-slate-200">{data.cep || "-"}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500">Município / UF</span>
                          <span className="text-slate-200">{data.municipio} - {data.uf}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500">Código IBGE</span>
                          <span className="text-slate-200">{data.codigo_municipio_ibge || "-"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Contato */}
                  <div className="glass-card p-5 md:p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm border-b border-slate-800 pb-3">
                      <Phone className="w-4 h-4" />
                      <span>Contatos & Comunicação</span>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs">Telefone Principal</span>
                        {data.ddd_telefone_1 ? (
                          <a
                            href={`tel:${data.ddd_telefone_1}`}
                            className="font-medium text-sky-400 hover:underline"
                          >
                            ({data.ddd_telefone_1.slice(0, 2)}) {data.ddd_telefone_1.slice(2)}
                          </a>
                        ) : (
                          <span className="text-slate-500">Não informado</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs">Telefone Secundário</span>
                        {data.ddd_telefone_2 ? (
                          <a
                            href={`tel:${data.ddd_telefone_2}`}
                            className="font-medium text-sky-400 hover:underline"
                          >
                            {data.ddd_telefone_2}
                          </a>
                        ) : (
                          <span className="text-slate-500">Não informado</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs">E-mail</span>
                        {data.email ? (
                          <a
                            href={`mailto:${data.email.toLowerCase()}`}
                            className="font-medium text-sky-400 hover:underline max-w-[220px] truncate"
                          >
                            {data.email.toLowerCase()}
                          </a>
                        ) : (
                          <span className="text-slate-500">Não informado</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Dados Cadastrais & Porte */}
                  <div className="glass-card p-5 md:p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm border-b border-slate-800 pb-3">
                      <Building2 className="w-4 h-4" />
                      <span>Estrutura & Porte</span>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-300">
                      <div>
                        <span className="block text-slate-500 mb-0.5">Porte Empresarial</span>
                        <span className="text-sm font-semibold text-white">{data.porte || "Não informado"}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 mb-0.5">Natureza Jurídica</span>
                        <span className="text-slate-200">{data.natureza_juridica} ({data.codigo_natureza_juridica})</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 mb-0.5">Capital Social</span>
                        <span className="text-base font-bold text-emerald-400">
                          {formatCurrency(data.capital_social)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Regime Tributário */}
                  <div className="glass-card p-5 md:p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm border-b border-slate-800 pb-3">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Regime Tributário</span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <div>
                          <span className="block font-semibold text-white">Simples Nacional</span>
                          {data.data_opcao_pelo_simples && (
                            <span className="text-slate-500">Desde: {formatDate(data.data_opcao_pelo_simples)}</span>
                          )}
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg font-bold ${
                            data.opcao_pelo_simples
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {data.opcao_pelo_simples ? "Optante" : "Não Optante"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <div>
                          <span className="block font-semibold text-white">MEI (Microempreendedor)</span>
                          {data.data_opcao_pelo_mei && (
                            <span className="text-slate-500">Desde: {formatDate(data.data_opcao_pelo_mei)}</span>
                          )}
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg font-bold ${
                            data.opcao_pelo_mei
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {data.opcao_pelo_mei ? "Optante" : "Não Optante"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Atividade Principal & Secundárias */}
                <div className="glass-card p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm border-b border-slate-800 pb-3">
                    <Briefcase className="w-4 h-4" />
                    <span>Atividades Econômicas (CNAEs)</span>
                  </div>

                  <div className="space-y-4 text-sm">
                    {/* Principal */}
                    <div>
                      <span className="text-xs uppercase tracking-wide text-slate-500 font-semibold block mb-1">
                        Atividade Principal
                      </span>
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="font-mono text-xs px-2.5 py-1 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-bold shrink-0">
                          {data.cnae_fiscal}
                        </span>
                        <span className="text-slate-200 font-medium">{data.cnae_fiscal_descricao}</span>
                      </div>
                    </div>

                    {/* Secundárias */}
                    {data.cnaes_secundarios && data.cnaes_secundarios.length > 0 && (
                      <div>
                        <span className="text-xs uppercase tracking-wide text-slate-500 font-semibold block mb-1">
                          Atividades Secundárias ({data.cnaes_secundarios.length})
                        </span>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {data.cnaes_secundarios.map((cnae, i) => (
                            <div
                              key={i}
                              className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-start gap-2.5 text-xs"
                            >
                              <span className="font-mono text-slate-400 font-bold shrink-0 pt-0.5">
                                {cnae.codigo}
                              </span>
                              <span className="text-slate-300">{cnae.descricao}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quadro Societário (QSA) */}
                {data.qsa && data.qsa.length > 0 && (
                  <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm border-b border-slate-800 pb-3">
                      <Users className="w-4 h-4" />
                      <span>Quadro de Sócios e Administradores (QSA - {data.qsa.length})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {data.qsa.map((socio, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-white text-sm">
                              {socio.nome_socio || "Nome não informado"}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium">
                              {socio.qualificacao_socio || "Sócio"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                            <div>
                              <span className="text-slate-500 block">Documento</span>
                              <span className="font-mono text-slate-300">{socio.cnpj_cpf_do_socio || "-"}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Faixa Etária</span>
                              <span className="text-slate-300">{socio.faixa_etaria || "-"}</span>
                            </div>
                            {socio.data_entrada_sociedade && (
                              <div className="col-span-2">
                                <span className="text-slate-500">Entrada na Sociedade: </span>
                                <span className="text-slate-300">{formatDate(socio.data_entrada_sociedade)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visualizador do JSON Bruto */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowRaw((s) => !s)}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-sky-300 transition"
                    >
                      <FileText className="w-4 h-4 text-sky-400" />
                      <span>{showRaw ? "Ocultar JSON Completo da API" : "Ver JSON Completo da API"}</span>
                      {showRaw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showRaw && (
                      <button
                        type="button"
                        onClick={() => handleCopy(JSON.stringify(data, null, 2), "raw_json")}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                      >
                        {copiedKey === "raw_json" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar JSON</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {showRaw && (
                    <pre className="mt-3 max-h-96 overflow-auto text-xs bg-slate-950 rounded-xl p-4 border border-slate-800 text-sky-200 font-mono">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROCESSAMENTO EM LOTE (CSV) */}
        {activeTab === "batch" && (
          <div className="space-y-6 fade-in">
            {/* Upload & Configuração Card */}
            <div className="glass-card p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-6 h-6 text-sky-400" />
                    Enriquecimento de Lista de CNPJs
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Envie um arquivo CSV contendo uma coluna com o cabeçalho <code className="text-sky-300 font-mono">cnpj</code>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shrink-0"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>Baixar Modelo CSV</span>
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed rounded-2xl transition-all duration-200 text-center ${
                  isDragging
                    ? "border-sky-400 bg-sky-500/10"
                    : fileToProcess
                    ? "border-emerald-500/50 bg-emerald-950/20"
                    : "border-slate-700 hover:border-slate-500 bg-slate-950/50"
                }`}
              >
                <input
                  type="file"
                  id={fileInputId}
                  accept=".csv,text/csv"
                  onChange={handleCsvInputChange}
                  disabled={csvProcessing}
                  className="sr-only"
                />

                {fileToProcess ? (
                  <div className="space-y-2">
                    <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <FileSpreadsheet className="w-7 h-7" />
                    </div>
                    <p className="text-base font-bold text-white">{fileToProcess.name}</p>
                    <p className="text-xs text-slate-400">
                      {(fileToProcess.size / 1024).toFixed(1)} KB • {totalRowsCount} registros identificados
                    </p>
                    <label
                      htmlFor={fileInputId}
                      className="inline-block mt-2 text-xs text-sky-400 hover:underline cursor-pointer font-semibold"
                    >
                      Trocar arquivo CSV
                    </label>
                  </div>
                ) : (
                  <label htmlFor={fileInputId} className="cursor-pointer space-y-3 block">
                    <div className="w-14 h-14 mx-auto rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">
                        Arraste e solte o CSV aqui, ou <span className="text-sky-400">clique para selecionar</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Suporta arquivos .CSV no padrão RFC 4180</p>
                    </div>
                  </label>
                )}
              </div>

              {/* Seletor e Filtro de Campos */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Filter className="w-4 h-4 text-sky-400" />
                      Campos para Enriquecer no Arquivo
                    </h3>
                    <p className="text-xs text-slate-400">
                      Escolha quais informações do JSON serão inseridas no novo CSV
                    </p>
                  </div>

                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 self-start sm:self-auto">
                    {selectedFields.length} de {allFields.length} campos selecionados
                  </span>
                </div>

                {/* Presets Rápidos */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Presets:</span>
                  {Object.entries(PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyPreset(preset.fields)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500/20 hover:text-sky-300 text-slate-300 border border-slate-700 transition"
                    >
                      {preset.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedFields([])}
                    className="text-xs px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition"
                  >
                    Limpar Todos
                  </button>
                </div>

                {/* Busca de campos */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filtrar campos (ex: razao, qsa, cnae, simples...)"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs md:text-sm text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition"
                  />
                </div>

                {/* Grid de Checkboxes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  {filteredFields.map((fieldKey) => (
                    <label
                      key={fieldKey}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer select-none transition ${
                        selectedFields.includes(fieldKey)
                          ? "bg-sky-500/10 text-sky-200 border border-sky-500/30"
                          : "hover:bg-slate-900 text-slate-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(fieldKey)}
                        onChange={() => toggleField(fieldKey)}
                        className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
                      />
                      <span className="truncate font-mono">{fieldKey}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Botão de Processar */}
              {fileToProcess && csvStatus !== "enriching" && csvStatus !== "done" && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={processCsv}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Iniciar Processamento ({totalRowsCount} linhas)</span>
                  </button>
                </div>
              )}

              {/* Barra de Progresso */}
              {csvStatus === "enriching" && (
                <div className="p-6 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                      Consultando API da Receita Federal...
                    </span>
                    <span className="font-bold text-sky-400 font-mono">
                      {Math.round(csvProgress * 100)}%
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${Math.round(csvProgress * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Sucesso & Download */}
              {csvStatus === "done" && csvDownloadUrl && (
                <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-4 fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">Arquivo Enriquecido com Sucesso!</h4>
                      <p className="text-xs text-emerald-300/80">
                        {csvMessage || "Todos os dados foram recuperados e consolidados no CSV."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={csvDownloadUrl}
                      download={csvFileName}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>Baixar {csvFileName}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setFileToProcess(null);
                        setCsvStatus("idle");
                        setPreviewData([]);
                        setCsvDownloadUrl(null);
                      }}
                      className="text-xs font-semibold px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    >
                      Processar Outro Arquivo
                    </button>
                  </div>
                </div>
              )}

              {/* Mensagem de Erro */}
              {csvStatus === "error" && csvMessage && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-500/40 bg-rose-950/40 text-rose-200 text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{csvMessage}</span>
                </div>
              )}
            </div>

            {/* Pré-visualização das 5 primeiras linhas */}
            {previewData.length > 0 && csvStatus === "idle" && (
              <div className="glass-card p-6 space-y-4 fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                    Pré-visualização do CSV Original (5 primeiras linhas)
                  </h3>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800">
                      <tr>
                        {Object.keys(previewData[0]).map((header) => (
                          <th key={header} className="px-4 py-3 font-semibold">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                      {previewData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          {Object.values(row).map((val, i) => (
                            <td key={i} className="px-4 py-2.5 whitespace-nowrap">
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

