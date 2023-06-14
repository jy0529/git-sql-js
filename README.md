# git-sql-js
(WIP) Search Git log by sql

```typescript
// example/base.ts

import { GitSqlLog } from '../source';

const gitSql = new GitSqlLog({});

const res = await gitSql.query('select * from log')

console.table(res)

```

![demo](/demo.png)

