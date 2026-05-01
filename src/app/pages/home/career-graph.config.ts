import type { Edge, Node, Options } from 'vis-network';

/** Cores por ramo de atividade (nós + arestas daquele ramo). */
export const BRANCH_PALETTE = {
  start: { bg: '#009688', border: '#00796b', edge: '#4db6ac' },
  tech: { bg: '#2563eb', border: '#1d4ed8', edge: '#60a5fa' },
  dados: { bg: '#7c3aed', border: '#6d28d9', edge: '#a78bfa' },
  produto: { bg: '#ea580c', border: '#c2410c', edge: '#fb923c' },
  negocios: { bg: '#059669', border: '#047857', edge: '#34d399' },
  saude: { bg: '#e11d48', border: '#be123c', edge: '#fb7185' },
  criativo: { bg: '#db2777', border: '#be185d', edge: '#f472b6' },
} as const;

function groupShadow() {
  return {
    enabled: true,
    color: 'rgba(94, 105, 119, 0.45)',
    size: 10,
    x: 0,
    y: 3,
  } as const;
}

function nodeGroupStyle(bg: string, border: string): NonNullable<Options['groups']>[string] {
  return {
    title: undefined,
    shape: 'circle',
    color: {
      border,
      background: bg,
      highlight: { background: '#202443', border: '#202443' },
    },
    shadow: groupShadow(),
    margin: 10,
  };
}

const hub = (
  id: number,
  label: string,
  branch: keyof typeof BRANCH_PALETTE,
): Node => ({ id, label, group: branch });

const leaf = (id: number, label: string, branch: keyof typeof BRANCH_PALETTE): Node => ({
  id,
  label,
  group: branch,
});

/** Três níveis: você → áreas → especializações (cores por área). */
export const CAREER_NODES: Node[] = [
  hub(1, 'Sua trajetória', 'start'),
  hub(2, 'Engenharia & Tech', 'tech'),
  hub(3, 'Dados & IA', 'dados'),
  hub(4, 'Produto & Design', 'produto'),
  hub(5, 'Negócios & Growth', 'negocios'),
  hub(6, 'Saúde & Ciências', 'saude'),
  hub(7, 'Criativo & Mídia', 'criativo'),
  leaf(21, 'Frontend', 'tech'),
  leaf(22, 'Backend', 'tech'),
  leaf(23, 'Mobile', 'tech'),
  leaf(24, 'Cloud / DevOps', 'tech'),
  leaf(25, 'QA Automation', 'tech'),
  leaf(31, 'Analytics / BI', 'dados'),
  leaf(32, 'Cientista de dados', 'dados'),
  leaf(33, 'ML Engineer', 'dados'),
  leaf(34, 'Eng. de dados', 'dados'),
  leaf(41, 'Product Manager', 'produto'),
  leaf(42, 'Product Owner', 'produto'),
  leaf(43, 'UX / UI', 'produto'),
  leaf(44, 'UX Research', 'produto'),
  leaf(51, 'Marketing digital', 'negocios'),
  leaf(52, 'Vendas B2B', 'negocios'),
  leaf(53, 'Finanças / FP&A', 'negocios'),
  leaf(54, 'Operações', 'negocios'),
  leaf(61, 'Saúde digital', 'saude'),
  leaf(62, 'Pesquisa clínica', 'saude'),
  leaf(63, 'Gestão em saúde', 'saude'),
  leaf(71, 'Brand & identity', 'criativo'),
  leaf(72, 'Motion / vídeo', 'criativo'),
  leaf(73, 'Conteúdo & SEO', 'criativo'),
];

function edge(from: number, to: number, color: string): Edge {
  return {
    from,
    to,
    color: { color, highlight: '#94a3b8' },
    arrows: { to: { enabled: true } },
    smooth: false,
  };
}

export const CAREER_EDGES: Edge[] = [
  edge(1, 2, BRANCH_PALETTE.tech.edge),
  edge(1, 3, BRANCH_PALETTE.dados.edge),
  edge(1, 4, BRANCH_PALETTE.produto.edge),
  edge(1, 5, BRANCH_PALETTE.negocios.edge),
  edge(1, 6, BRANCH_PALETTE.saude.edge),
  edge(1, 7, BRANCH_PALETTE.criativo.edge),
  ...[21, 22, 23, 24, 25].map((id) => edge(2, id, BRANCH_PALETTE.tech.edge)),
  ...[31, 32, 33, 34].map((id) => edge(3, id, BRANCH_PALETTE.dados.edge)),
  ...[41, 42, 43, 44].map((id) => edge(4, id, BRANCH_PALETTE.produto.edge)),
  ...[51, 52, 53, 54].map((id) => edge(5, id, BRANCH_PALETTE.negocios.edge)),
  ...[61, 62, 63].map((id) => edge(6, id, BRANCH_PALETTE.saude.edge)),
  ...[71, 72, 73].map((id) => edge(7, id, BRANCH_PALETTE.criativo.edge)),
];

export const careerNetworkOptions: Options = {
  nodes: {
    shape: 'circle',
    font: { size: 11, color: '#ffffff' },
    mass: 0.5,
    widthConstraint: { maximum: 88 },
  },
  edges: {
    smooth: false,
    arrows: { to: { enabled: true } },
  },
  interaction: {
    hover: true,
    tooltipDelay: 200,
    dragNodes: true,
    dragView: true,
    zoomView: true,
  },
  layout: {
    improvedLayout: false,
    hierarchical: { enabled: false, sortMethod: 'directed' },
  },
  physics: {
    enabled: true,
    adaptiveTimestep: true,
    stabilization: {
      enabled: true,
      iterations: 320,
      updateInterval: 50,
      fit: true,
    },
    barnesHut: {
      avoidOverlap: 0.82,
      springLength: 220,
      springConstant: 0.048,
      damping: 0.58,
    },
  },
  groups: {
    start: nodeGroupStyle(BRANCH_PALETTE.start.bg, BRANCH_PALETTE.start.border),
    tech: nodeGroupStyle(BRANCH_PALETTE.tech.bg, BRANCH_PALETTE.tech.border),
    dados: nodeGroupStyle(BRANCH_PALETTE.dados.bg, BRANCH_PALETTE.dados.border),
    produto: nodeGroupStyle(BRANCH_PALETTE.produto.bg, BRANCH_PALETTE.produto.border),
    negocios: nodeGroupStyle(BRANCH_PALETTE.negocios.bg, BRANCH_PALETTE.negocios.border),
    saude: nodeGroupStyle(BRANCH_PALETTE.saude.bg, BRANCH_PALETTE.saude.border),
    criativo: nodeGroupStyle(BRANCH_PALETTE.criativo.bg, BRANCH_PALETTE.criativo.border),
  },
};
