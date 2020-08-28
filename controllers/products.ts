import { Client } from 'https://deno.land/x/postgres/mod.ts'
import { Product } from '../types.ts'
import { dbCreds } from '../config.ts'

// Init client
const client = new Client(dbCreds)

// @desc    Get all products
// @route   GET /api/v1/products
const getProducts = async ({ response }: { response: any }) => {

  try {

    await client.connect()
    const query = "SELECT * FROM products;"

    const result = await client.query(query)

    const products = result.rows.map(product => {

      const formattedProduct: any = {}
      result.rowDescription.columns.forEach((element, i) => {
        formattedProduct[element.name] = product[i]
      })

      return formattedProduct
    })

    response.status = 201
    response.body = {
      success: true,
      data: products
    }

  } catch (err) {
    response.status = 500
    response.body = {
      success: false,
      message: err.toString()
    }
  } finally {
    await client.end()
  }
}

// @desc    Get single product
// @route   GET /api/v1/product/:id
const getProduct = async ({ params, response }: { params: { id: string }, response: any }) => {
  try {

    await client.connect()
    const query = "SELECT * FROM products WHERE id = $1;"

    const result = await client.query(query, params.id)

    if (result.rows.toString() === '') {
      response.status = 404
      response.body = {
        success: false,
        message: `No product with the id of ${params.id} was found`
      }
      return
    }

    const product: any = {}

    result.rows.forEach(row => {
      result.rowDescription.columns.forEach((element, i) => {
        product[element.name] = row[i]
      })
    })

    response.status = 201
    response.body = {
      success: true,
      data: product
    }

  } catch (err) {
    response.status = 500
    response.body = {
      success: false,
      message: err.toString()
    }
  } finally {
    await client.end()
  }
}

// @desc    Add product
// @route   POST /api/v1/products
const addProduct = async ({ request, response }: { request: any, response: any }) => {

  const body = await request.body()

  if (!request.hasBody) {
    response.status = 400
    response.body = {
      success: false,
      message: 'No data'
    }
    return
  }

  try {
    await client.connect()
    const query = "INSERT INTO products(name, description, price) VALUES($1, $2, $3);"
    const product: Product = await body.value

    const result = await client.query(query, product.name, product.description, product.price)

    response.status = 201
    response.body = {
      success: true,
      data: product
    }

  } catch (err) {
    response.status = 500
    response.body = {
      success: false,
      message: err.toString()
    }
  } finally {
    await client.end()
  }
}

// @desc    Update product
// @route   PUT /api/v1/products/:id
const updateProduct = async ({ params, request, response }: { params: { id: string }, request: any, response: any }) => {

  await getProduct({ params: { id: params.id }, response })

  if (response.status === 404) {
    return
  }

  const body = await request.body()

  if (!request.hasBody) {
    response.status = 400
    response.body = {
      success: false,
      message: 'No data'
    }
    return
  }

  try {
    await client.connect()
    const query = "UPDATE Products SET name=$1, description=$2, price=$3 WHERE id=$4;"
    const product: Product = await body.value

    await client.query(query, product.name, product.description, product.price, params.id)

    response.status = 200
    response.body = {
      success: true,
      data: product
    }

  } catch (err) {
    response.status = 500
    response.body = {
      success: false,
      message: err.toString()
    }
  } finally {
    await client.end()
  }
}

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
const deleteProduct = async ({ params, response }: { params: { id: string }, response: any }) => {

  await getProduct({ params: { id: params.id }, response })

  if (response.status === 404) {
    return
  }

  try {

    await client.connect()
    const query = "DELETE FROM products WHERE id = $1;"
    await client.query(query, params.id)

    response.status = 204
    response.body = {
      success: true,
      message: `Product with id ${params.id} has been deleted.`
    }

  } catch (err) {
    response.status = 500
    response.body = {
      success: false,
      message: err.toString()
    }
  } finally {
    await client.end()
  }
}

export { getProducts, getProduct, addProduct, updateProduct, deleteProduct }
