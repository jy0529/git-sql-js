import { GitSqlClient, LogResult } from '../source/index'

describe('select', () => {
	const client = new GitSqlClient()
	test('select *', async () => {
		const result = await client.query('select * from log') as LogResult[]
		expect(result.length > 0).toBe(true)
	})

	test('select hash', async () => {
		const result = await client.query('select hash from log') as LogResult[]
		expect(result.length > 0).toBe(true)
		expect(result[0]).toBeDefined()
		expect(result[0]?.hash).toBeDefined()
		expect(result[0]?.message).toBeUndefined()
		expect(result[0]?.author_email).toBeUndefined()
		expect(result[0]?.author_name).toBeUndefined()
		expect(result[0]?.message).toBeUndefined()
		expect(result[0]?.date).toBeUndefined()
		expect(result[0]?.body).toBeUndefined()
		expect(result[0]?.files).toBeUndefined()
	})

	test('select where =', async () => {
		const result = await client.query("select * from log where hash = '8ef416ed259656b3ccc56c952f8eac8515a5f9b0'") as LogResult[]
		expect(result.length).toBe(1)
	})

	test('select where and', async () => {
		let result = await client.query("select * from log where hash = '8ef416ed259656b3ccc56c952f8eac8515a5f9b0' and author_name = 'Jy'") as LogResult[]
		expect(result.length).toBe(1)

		result = await client.query("select * from log where hash = '8ef416ed259656b3ccc56c952f8eac8515a5f9b0' and author_name = 'NOT'") as LogResult[]
		expect(result.length).toBe(0)
	})

	test('select where or', async () => {
		const result = await client.query("select * from log where hash = '8ef416ed259656b3ccc56c952f8eac8515a5f9b0' or author_name = 'Jy'") as LogResult[]
		expect(result.length > 0).toBe(true)
	})

})
