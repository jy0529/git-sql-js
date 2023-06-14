export type ColumnType = 'hash' | 'author_name' | 'author_email' | 'file' | 'date' | 'head_message' | 'body_message'

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
		name: 'file',
		type: String,
	},
	{
		name: 'date',
		type: [String, Number, Date],
	},
	{
		name: 'head_message',
		type: String,
	},
	{
		name: 'body_message',
		type: String,
	},
]
