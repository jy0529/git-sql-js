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
	limit: number = Infinity
	orderBy: any

	constructor(ast: SQLParser.Select) {
		this.ast = ast
		this.initColumns()
		this.initWhere()
		this.initLimit()
		this.initOrderBy()
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

	initLimit() {
		const limitAST = this.ast.limit
		if (limitAST) {
			this.limit = limitAST.value[0]?.value ?? Infinity
		}
	}

	initOrderBy() {
		const orderByAST = this.ast.orderby ?? []

		const comparators = []
		for(let ast of orderByAST) {
			let column = ''
			if (ast.expr.type === 'column_ref') {
				column = ast.expr.column
			}
			if (ast.type === 'ASC') {
				comparators.push((a: any, b: any) => {
					if (a?.[column] === b?.[column]) return 0
					return lessThan(a?.[column], b?.[column]) ? -1 : 1
				})
			} else {
				comparators.push((a: any, b: any) => {
					if (a?.[column] === b?.[column]) return 0
					return greaterThan(a?.[column], b?.[column]) ? -1 : 1
				})
			}
		}

		this.orderBy = comparators
	}

	find(data: any) {
		return R.pipe(
			// @ts-ignore
			R.filter(this.where),
			R.map(R.pickAll(this.columns)),
			R.sortWith(this.orderBy),
			R.take(this.limit),
		)(data)
	}

}

/**
 *
 * Compare Functions
 *
 */

export function greaterThan(x1: any, x2: any): boolean {
	if (isDate(parseISO(x1)) && isDate(parseISO(x2))) {
		return isAfter(new Date(x1), new Date(x2))
	} else {
		return x1 > x2
	}
}

export function greaterThanOrEqual(x1: any, x2: any):boolean {
	if (isDate(parseISO(x1)) && isDate(parseISO(x2))) {
		return greaterThan(x1, x2) || isEqual(new Date(x1), new Date(x2))
	} else {
		return x1 >= x2
	}
}

export function lessThan(x1:any, x2:any): boolean {
	if (isDate(parseISO(x1)) && isDate(parseISO(x2))) {
		return isBefore(new Date(x1), new Date(x2))
	} else {
		return x1 < x2
	}
}

export function lessThanOrEqual(x1:any, x2:any): boolean {
	if (isDate(parseISO(x1)) && isDate(parseISO(x2))) {
		return lessThan(x1, x2) || isEqual(new Date(x1), new Date(x2))
	} else {
		return x1 <= x2
	}
}
