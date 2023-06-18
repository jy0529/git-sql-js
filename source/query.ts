import { ColumnType, columns } from "./columns";
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
		const where = this.ast.where

		if (!where) {
			this.where = R.always(true)
			return
		}

		function recursive(ASTNode: any): any {
			const left = ASTNode.left ? recursive(ASTNode.left) : null
			const right = ASTNode.right ? recursive(ASTNode.right) : null

			if (ASTNode.type === 'binary_expr') {
				if (ASTNode.operator === 'AND') {
					return R.allPass([
						left,
						right,
					])
				} else if (ASTNode.operator === 'OR') {
					return R.anyPass(
						[
							left,
							right,
						]
					)
				} else if (ASTNode.operator === '=') {
					return R.propEq(right.value, left.value)
				} else {
					// TODO
				}
			} else {
				if (ASTNode.type === 'column_ref') {
					return {
						type: ASTNode.type,
						value: ASTNode.column,
					}
				} else {
					return {
						type: ASTNode.type,
						value: ASTNode.value,
					}
				}
			}
		}

		this.where = recursive(where);
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
			// @ts-ignore
			R.filter(this.where),
			R.map(R.pickAll(this.columns)),
		)(data)
	}

}
