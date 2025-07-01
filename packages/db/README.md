# DB Migrations

To create the events table, run:

```
psql -h localhost -U audit -d audit -f migrations.sql
```

(Default password: audit)
