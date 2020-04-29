-- public.avouch_user_table definition

-- Drop table

-- DROP TABLE public.avouch_user_table;

CREATE TABLE public.avouch_user_table (
	user_id bigserial NOT NULL,
	first_name varchar(100) NOT NULL,
	last_name varchar(100) NOT NULL,
	email varchar(256) NOT NULL,
	"password" varchar(100) NOT NULL,
	account_reset_dt timestamp NULL,
	account_reset_token varchar(300) NULL,
	account_created_dt timestamp NOT NULL,
	account_updated_dt timestamp NULL,
	account_details jsonb NULL,
	authorised_tenants jsonb NOT NULL DEFAULT '[]'::jsonb,
	account_hash varchar(500) NULL,
	account_pass varchar(500) NULL,
	CONSTRAINT prometheus_user_table_pkey PRIMARY KEY (user_id)
);