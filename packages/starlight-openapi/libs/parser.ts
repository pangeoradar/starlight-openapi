import OpenAPIParser from '@readme/openapi-parser'
import type { AstroIntegrationLogger } from 'astro'
import type { OpenAPIV3 } from 'openapi-types'

import type { Schema, StarlightOpenAPISchemaConfig } from './schema'

export async function parseSchema(
  logger: AstroIntegrationLogger,
  config: StarlightOpenAPISchemaConfig,
): Promise<Schema> {
  try {
    logger.info(`Parsing OpenAPI schema at '${config.schema}'.`)

    const document = await OpenAPIParser.bundle(config.schema)

    enrichSchema((document as OpenAPIV3.Document).components?.schemas ?? {})

    return { config, document }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message)
    }

    throw error
  }
}

function isReferenceObject(
  schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
): schema is OpenAPIV3.ReferenceObject {
  // @ts-expect-error check if $ref exists
  return Boolean(schema.$ref)
}
function enrichSchema(schemas: OpenAPIV3.ComponentsObject['schemas']) {
  for (const [key, schema] of Object.entries(schemas ?? {})) {
    if (isReferenceObject(schema)) {
      continue
    }

    schema['x-identifier'] = key
  }
}
