import { GitSqlClient } from '../source/index';

const gitSql = new GitSqlClient({});

const res = await gitSql.query('select * from log')

console.table(res)
