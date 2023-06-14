import { ColumnType, columns } from "./columns.js";
import SQLParser from 'node-sql-parser';
import * as R from 'ramda';

interface IQuery {
	find(data: any): any
}

export class Query implements IQuery {
	ast: SQLParser.Select
	columns: ColumnType[] = []
	where: any

	constructor(ast: SQLParser.Select) {
		this.ast = ast
		this.initColumns();
		this.initWhere();
	}

	initWhere() {
		// TODO
	}

	initColumns() {
		const column = (Column: SQLParser.Column) => ((Column.expr as SQLParser.ColumnRef).column)

		if (this.ast.columns === '*') {
			this.columns = columns.map(c => c.name)
		} else {
			this.columns = R.map(column, this.ast.columns) as ColumnType[]
		}

	}

	find(data: any) {
		return R.pipe(
			R.map(R.pickAll(this.columns)),
		)(data)
	}

}
