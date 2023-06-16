# git-sql-log 
(WIP) Search Git log by sql

```typescript
// example/base.js

import { GitSqlLog } from 'git-sql-log';

const gitSqlLog = new GitSqlLog({});

const res = await gitSqlLog.query('select * from log')

console.table(res)

```

![demo](/example.png)

