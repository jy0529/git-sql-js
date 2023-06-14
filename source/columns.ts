export type ColumnType = 'hash' | 'author_name' | 'author_email' | 'file' | 'date' | 'message' | 'body'

export const columns: Array<{ name: ColumnType, type: any }> = [
	{
		name: 'hash',
		type: String,
	},
	{
		name: 'author_name',
		type: String,
	},
	{
		name: 'author_email',
		type: String,
	},
	{
		name: 'date',
		type: [String, Number, Date],
	},
	{
		name: 'message',
		type: String,
	},
	{
		name: 'body',
		type: String,
	},
]
