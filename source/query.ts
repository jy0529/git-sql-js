import { ColumnType, columns } from "./columns";
import SQLParser from 'node-sql-parser';
import * as R from 'ramda';
import { isDate, isAfter, isEqual, isBefore, parseISO } from 'date-fns'

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

		const CompareActionMapping = new Map<string, Function>()
		CompareActionMapping.set('>', greaterThan)
		CompareActionMapping.set('>=', greaterThanOrEqual)
		CompareActionMapping.set('<', lessThan)
		CompareActionMapping.set('<=', lessThanOrEqual)

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
				} else if (CompareActionMapping.has(ASTNode.operator)) {
					return R.propSatisfies((x) => {
						return (CompareActionMapping.get(ASTNode.operator) as Function)(x, right.value)
					}, left.value)}
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

/**
 *
 * Compare Functions
 *
 */

function greaterThan(x1: any, x2: any): boolean {
	if (isDate(parseISO(x1)) && isDate(parseISO(x2))) {
		return isAfter(new Date(x1), new Date(x2))
	} else {
		return x1 > x2
	}
}

function greaterThanOrEqual(x1: any, x2: any):boolean {
	if (isDate(parseISO(x1)) && isDate(parseISO(x2))) {
		return greaterThan(x1, x2) || isEqual(new Date(x1), new Date(x2))
	} else {
		return x1 >= x2
	}
}

function lessThan(x1:any, x2:any): boolean {
	if (isDate(parseISO(x1)) && isDate(parseISO(x2))) {
		return isBefore(new Date(x1), new Date(x2))
	} else {
		return x1 < x2
	}
}

function lessThanOrEqual(x1:any, x2:any): boolean {
	if (isDate(parseISO(x1)) && isDate(parseISO(x2))) {
		return lessThan(x1, x2) || isEqual(new Date(x1), new Date(x2))
	} else {
		return x1 <= x2
	}
}
