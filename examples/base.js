import { GitSqlLog } from '../dist/index.js';

const gitSql = new GitSqlLog({});

const res = await gitSql.query('select * from log')

console.table(res)
