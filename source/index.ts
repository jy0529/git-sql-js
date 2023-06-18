import { simpleGit, SimpleGit, SimpleGitOptions } from 'simple-git'
import SQLParser from 'node-sql-parser';
import { Query } from './query';

interface ILogResult {
	hash: string
	date: Date
	files: string | string[]
	author_name: string
	author_email?: string
	message?: string
	body?: string
}

export class LogResult implements ILogResult {
	hash: string
	date: Date
	files: string | string[]
	author_name: string
	author_email: string | undefined
	message: string | undefined;
	body: string | undefined;

	constructor(result: ILogResult) {
		this.hash = result.hash;
		this.date = result.date;
		this.files = result.files;
		this.author_name = result.author_name;
		this.author_email = result.author_email;
		this.message = result.message;
		this.body = result.body;
	}
}

interface IGitSqlLog {
	options: Partial<SimpleGitOptions>
	query(query: string, from?: string, to?: string): void
}

export class GitSqlClient implements IGitSqlLog {
	options: Partial<SimpleGitOptions>;
	private client: SimpleGit;
	private sqlParser = new SQLParser.Parser();

	constructor(options?: Partial<SimpleGitOptions>) {
		this.options = options ?? {};
		this.client = simpleGit(this.options);
	}

	async query(query: string, from?: string, to?: string) {
		const ast = this.sqlParser.astify(query) as SQLParser.Select

		const result = await this.client.log({
			from,
			to,
			strictDate: true,
		})

		const all = result.all

		const queryInstance = new Query(ast)
		return queryInstance.find(all)
	}
}
