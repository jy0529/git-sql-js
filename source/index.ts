import { simpleGit, SimpleGit, SimpleGitOptions } from 'simple-git'
import SQLParser from 'node-sql-parser';
import { Query } from './query';

interface LogResult {
	hash: string
	date: Date
	files: string | string[]
	author_name: string
	author_email?: string
	head_message?: string
	body_message?: string
}

class LogResult {
	constructor(result: LogResult) {
		this.hash = result.hash;
		this.date = result.date;
		this.files = result.files;
		this.author_name = result.author_name;
		this.author_email = result.author_email;
		this.head_message = result.head_message;
		this.body_message = result.body_message;
	}
}

interface IGitSql {
	options: Partial<SimpleGitOptions>
	query(query: string, from?: string, to?: string): void
}

export class GitSql implements IGitSql {
	options: Partial<SimpleGitOptions>;
	private client: SimpleGit;
	private sqlParser = new SQLParser.Parser();

	constructor(options: Partial<SimpleGitOptions>) {
		this.options = options;
		this.client = simpleGit(options);
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
