-- Migration: Tax Brackets Configuration
-- Date: 2025-12-27
-- Description: Adiciona tabelas para configuração dinâmica de faixas de impostos

-- =====================================================
-- TAX CONFIGURATION (configurações gerais)
-- =====================================================
CREATE TABLE IF NOT EXISTS tax_configurations (
    id SERIAL PRIMARY KEY,
    year INTEGER UNIQUE NOT NULL,
    inss_deduction_per_dependent DECIMAL(10,2) NOT NULL DEFAULT 189.59,
    fgts_rate DECIMAL(5,4) NOT NULL DEFAULT 0.08,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INSS BRACKETS (faixas progressivas de INSS)
-- =====================================================
CREATE TABLE IF NOT EXISTS inss_brackets (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    min_value DECIMAL(10,2) NOT NULL,
    max_value DECIMAL(10,2) NOT NULL, -- 0 significa sem limite
    rate DECIMAL(5,4) NOT NULL,
    "order" INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inss_brackets_year ON inss_brackets(year);
CREATE INDEX idx_inss_brackets_active ON inss_brackets(is_active);

-- =====================================================
-- IRPF BRACKETS (faixas progressivas de IRPF)
-- =====================================================
CREATE TABLE IF NOT EXISTS irpf_brackets (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    min_value DECIMAL(10,2) NOT NULL,
    max_value DECIMAL(10,2) NOT NULL, -- 0 significa sem limite
    rate DECIMAL(5,4) NOT NULL,
    deduction DECIMAL(10,2) NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_irpf_brackets_year ON irpf_brackets(year);
CREATE INDEX idx_irpf_brackets_active ON irpf_brackets(is_active);

-- =====================================================
-- SEED DATA - 2025
-- =====================================================

-- Configuração geral 2025
INSERT INTO tax_configurations (year, inss_deduction_per_dependent, fgts_rate, is_active)
VALUES (2025, 189.59, 0.08, TRUE)
ON CONFLICT (year) DO NOTHING;

-- Faixas INSS 2025
INSERT INTO inss_brackets (year, min_value, max_value, rate, "order", is_active) VALUES
    (2025, 0.00, 1412.00, 0.075, 1, TRUE),      -- 7.5% até R$ 1.412,00
    (2025, 1412.01, 2666.68, 0.09, 2, TRUE),    -- 9% de R$ 1.412,01 até R$ 2.666,68
    (2025, 2666.69, 4000.03, 0.12, 3, TRUE),    -- 12% de R$ 2.666,69 até R$ 4.000,03
    (2025, 4000.04, 7786.02, 0.14, 4, TRUE)     -- 14% de R$ 4.000,04 até R$ 7.786,02
ON CONFLICT DO NOTHING;

-- Faixas IRPF 2025
INSERT INTO irpf_brackets (year, min_value, max_value, rate, deduction, "order", is_active) VALUES
    (2025, 0.00, 2259.20, 0.000, 0.00, 1, TRUE),           -- Isento até R$ 2.259,20
    (2025, 2259.21, 2826.65, 0.075, 169.44, 2, TRUE),      -- 7.5% - R$ 169,44
    (2025, 2826.66, 3751.05, 0.15, 381.44, 3, TRUE),       -- 15% - R$ 381,44
    (2025, 3751.06, 4664.68, 0.225, 662.77, 4, TRUE),      -- 22.5% - R$ 662,77
    (2025, 4664.69, 999999999.99, 0.275, 896.00, 5, TRUE)  -- 27.5% - R$ 896,00
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA - 2026 (exemplo para próximo ano)
-- =====================================================

-- Configuração geral 2026 (exemplo - ajustar quando valores oficiais saírem)
INSERT INTO tax_configurations (year, inss_deduction_per_dependent, fgts_rate, is_active)
VALUES (2026, 195.00, 0.08, FALSE) -- FALSE = não ativo ainda
ON CONFLICT (year) DO NOTHING;

-- Faixas INSS 2026 (exemplo - ajustar quando valores oficiais saírem)
INSERT INTO inss_brackets (year, min_value, max_value, rate, "order", is_active) VALUES
    (2026, 0.00, 1450.00, 0.075, 1, FALSE),
    (2026, 1450.01, 2750.00, 0.09, 2, FALSE),
    (2026, 2750.01, 4150.00, 0.12, 3, FALSE),
    (2026, 4150.01, 8000.00, 0.14, 4, FALSE)
ON CONFLICT DO NOTHING;

-- Faixas IRPF 2026 (exemplo - ajustar quando valores oficiais saírem)
INSERT INTO irpf_brackets (year, min_value, max_value, rate, deduction, "order", is_active) VALUES
    (2026, 0.00, 2400.00, 0.000, 0.00, 1, FALSE),
    (2026, 2400.01, 3000.00, 0.075, 180.00, 2, FALSE),
    (2026, 3000.01, 4000.00, 0.15, 405.00, 3, FALSE),
    (2026, 4000.01, 5000.00, 0.225, 705.00, 4, FALSE),
    (2026, 5000.01, 999999999.99, 0.275, 955.00, 5, FALSE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE tax_configurations IS 'Configurações gerais de impostos por ano';
COMMENT ON TABLE inss_brackets IS 'Faixas progressivas de INSS por ano';
COMMENT ON TABLE irpf_brackets IS 'Faixas progressivas de IRPF por ano';

COMMENT ON COLUMN inss_brackets.max_value IS 'Valor máximo da faixa. Use 999999999.99 para última faixa sem limite';
COMMENT ON COLUMN irpf_brackets.max_value IS 'Valor máximo da faixa. Use 999999999.99 para última faixa sem limite';
COMMENT ON COLUMN irpf_brackets.deduction IS 'Parcela a deduzir do cálculo do imposto';
