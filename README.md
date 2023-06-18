# git-sql-log 
Search Git log by SQL

## features
- [x] select *

- [x] select column1, column2

- [x] where and or

- [x] order by asc desc

- [x] limit N

```typescript
// example/base.js

import { GitSqlClient } from 'git-sql-log';

const gitSqlClient = new GitSqlClient({});

const res = await gitSqlClient.query('select * from log')

console.table(res)

```

![demo](/example.png)

