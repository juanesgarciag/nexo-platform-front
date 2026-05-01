export type PositionStatus = "open" | "closed" | "pending_redeem" | "redeemed" | "lost";

export type Position = {
  id: number;
  condition_id: string;
  token_id: string;
  source_wallet: string | null;
  outcome: string;
  pregunta: string;
  categoria: string | null;
  confianza: string | null;
  precio_entrada: number;
  precio_visible: number | null;
  precio_actual: number | null;
  cantidad: number;
  tokens: number;
  ts_entrada: string;
  ts_salida: string | null;
  end_date: string | null;
  sig_type: string | null;
  whale: boolean | null;
  simulado: boolean | null;
  exit_motivo: string | null;
  exit_price: number | null;
  pnl_usdc: number | null;
  pnl_pct: number | null;
  status: PositionStatus;
  entry_mid: number | null;
  entry_spread: number | null;
  entry_depth_bid: number | null;
  entry_slippage: number | null;
  whale_addr?: string | null;
  whale_name?: string | null;
  score?: number | null;
  score_label?: string | null;
  score_detalle?: string | null;
  origen?: string | null;
  sin_sl?: boolean | null;
  tp_parcial?: boolean | null;
  flip?: boolean | null;
  hedge_opened?: boolean | null;
  hedge_for?: string | null;
  hedge_key?: string | null;
  hedge_reason?: string | null;
  hedge_count?: number | null;
  portfolio_mode?: string | null;
  event_category?: string | null;
  event_slug?: string | null;
  football_sibling_team?: string | null;
  precio_pico?: number | string | null;
};

export type WhaleAgg = {
  whale_addr: string;
  whale_name: string | null;
  is_priority: boolean;
  trades: number;
  wins: number;
  losses: number;
  open: number;
  win_rate: number;
  capital_invertido: string;
  pnl_bruto: string;
  pnl_real: string | null;
};

export type ScoreAgg = {
  score: number;
  score_label: string | null;
  trades: number;
  wins: number;
  losses: number;
  open: number;
  win_rate: number;
  capital_invertido: string;
  pnl_bruto: string;
  pnl_real: string | null;
};

export type PositionDetail = Position & {
  raw_json: Record<string, unknown> | null;
  trades: Trade[];
};

export type HedgedPair = {
  hedge_key: string;
  primary: Position;
  hedge: Position | null;
  combined_pnl_usdc: string | number | null;
  combined_invertido: string | number | null;
};

export type HedgedPositions = {
  total: number;
  pairs: HedgedPair[];
};

export type Trade = {
  id: number;
  tipo: "entrada" | "salida" | "resolucion" | "monitor";
  token_id: string | null;
  condition_id: string | null;
  outcome: string | null;
  precio: number | null;
  cantidad: number | null;
  tokens: number | null;
  pnl_pct: number | null;
  ts: string;
  razon: string | null;
  confianza: string | null;
  categoria: string | null;
  source_wallet?: string | null;
  raw_json?: Record<string, unknown> | null;
};

export type Deposit = {
  id: number;
  source: "auto" | "manual";
  tipo: "deposito" | "retiro";
  cantidad_usdc: number;
  fecha: string;
  nota: string | null;
  tx_hash: string | null;
  saldo_referencia_after: number | null;
  created_at: string;
};

export type Heartbeat = {
  id: number;
  loop: string;
  last_tick: string;
  balance: number | null;
  errors_last: number | null;
};

export type CategoriaStat = {
  categoria: string;
  trades: number;
  win_rate: number;
  pnl_usdc: number;
};

export type ConfianzaStat = {
  confianza: string;
  trades: number;
  win_rate: number;
  pnl_usdc: number;
};

export type HistoryPoint = {
  ts: string;
  cumulative_pnl: string | number;
};

export type ClosedPositionBrief = {
  condition_id: string;
  pregunta: string | null;
  outcome: string | null;
  pnl_usdc: string | number;
  pnl_pct: string | number;
  categoria: string | null;
  ts_salida: string | null;
};

export type WalletAccount = {
  label: "eoa" | "proxy";
  address: string;
  cash_usdc: string;         // on-chain USDC
  polymarket_cash: string;   // USDC inside Polymarket CLOB
  position_value: string;    // Polymarket positions MTM
  matic: string;
  total: string;
};

export type WalletSnapshot = {
  accounts: WalletAccount[];
  total_cash: string;              // on-chain USDC total
  total_polymarket_cash: string;   // Polymarket CLOB cash total
  total_position_value: string;    // positions MTM total
  total: string;                   // everything
  fetched_at: string;
};

export type RedeemablePosition = {
  title: string;
  outcome: string;
  value: number;
  size: number;
  conditionId: string;
};

export type RedeemableAccount = {
  label: "eoa" | "proxy";
  address: string;
  redeemable: RedeemablePosition[];
  redeemable_total: string;
  mergeable: RedeemablePosition[];
  mergeable_total: string;
};

export type RedeemablesData = {
  accounts: RedeemableAccount[];
  total_redeemable: string;
  total_mergeable: string;
};

export type WalletHistoryPoint = {
  fecha: string;
  cash_usdc: string;
  position_value: string | null;
  total: string | null;
  source: "auto" | "historical_rpc";
  cum_deposits: string;
};

export type TurnoverDay = {
  fecha: string;
  num_trades: number;
  capital_invertido: string;
  pnl_realizado: string;        // raw bot value (bot ledger, inflated)
  pnl_real_dia: string | null;  // snapshot diff or calibrated
  pnl_source: "snapshot" | "calibrated";
  capital_disponible: string;
  vueltas: string | null;
  trades_ganados: number;
  trades_perdidos: number;
  deposito_neto_dia: string;
  wallet_snapshot: string | null;
};

export type PnlSummary = {
  balance: string | number;
  valor_posiciones: string | number;
  depositado_total: string | number;
  saldo_referencia: string | number;
  pnl_real: string | number;
  pnl_pct: string | number;
  wallet_cash: string | number | null;
  wallet_positions_value: string | number | null;
  wallet_total: string | number | null;
  realized_pnl: string | number | null;
  net_real_pnl: string | number | null;
  net_real_pnl_pct: string | number | null;
  deposits_total: string | number | null;
  withdrawals_total: string | number | null;
  capital_neto: string | number | null;
  win_rate: string | number;
  trades_total: number;
  by_categoria: CategoriaStat[];
  by_confianza: ConfianzaStat[];
  history: HistoryPoint[];
  top_winners: ClosedPositionBrief[];
  top_losers: ClosedPositionBrief[];
  recent_closed: ClosedPositionBrief[];
};

export type BotParams = {
  TAKE_PROFIT_X?: number;
  STOP_LOSS_PCT?: number;
  MAX_ENTRADA?: number;
  MAX_DIARIO?: number;
  MAX_POSICIONES?: number;
  MAX_POR_CATEGORIA?: number;
  MIN_SCORE?: number;
  PRECIO_MIN?: number;
  PRECIO_MAX?: number;
  MIN_LIQUIDEZ?: number;
  TRAILING_STOP_PCT?: number;
  TRAILING_MIN_PROFIT_PCT?: number;
  MAX_POR_MERCADO?: number;
};
