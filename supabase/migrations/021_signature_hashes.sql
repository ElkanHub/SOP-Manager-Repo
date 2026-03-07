-- 021_signature_hashes.sql
-- Adds document_hash to signature_certificates for cryptographic integrity

ALTER TABLE signature_certificates ADD COLUMN IF NOT EXISTS document_hash text;
