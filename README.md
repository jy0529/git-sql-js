# git-sql-js
(WIP) Search Git log by sql

```typescript
// example/base.js

import { GitSqlLog } from 'git-sql-log';

const gitSql = new GitSqlLog({});

const res = await gitSql.query('select * from log')

console.table(res)

```

![demo](/example.png)

