import app from './src/app.js'
import sum from './src/utilis.js'
import request from 'supertest'

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})

it('should return 200 status code', async () => {
  const response = await request(app).get('/').send()
  expect(response.statusCode).toBe(200)
})
