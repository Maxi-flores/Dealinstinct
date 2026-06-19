import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  BatchWriteCommand,
  BatchGetCommand,
} from '@aws-sdk/lib-dynamodb';
import { awsConfig, tables } from './config';

// Initialize DynamoDB Client
const client = new DynamoDBClient(awsConfig);
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
});

// Generic CRUD Operations
export async function getItem<T>(tableName: string, key: Record<string, any>): Promise<T | null> {
  const command = new GetCommand({
    TableName: tableName,
    Key: key,
  });
  const response = await docClient.send(command);
  return (response.Item as T) || null;
}

export async function putItem<T>(tableName: string, item: T): Promise<T> {
  const command = new PutCommand({
    TableName: tableName,
    Item: item as Record<string, any>,
  });
  await docClient.send(command);
  return item;
}

export async function updateItem(
  tableName: string,
  key: Record<string, any>,
  updates: Record<string, any>
): Promise<void> {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  Object.entries(updates).forEach(([field, value], index) => {
    const nameKey = `#field${index}`;
    const valueKey = `:value${index}`;
    updateExpressions.push(`${nameKey} = ${valueKey}`);
    expressionAttributeNames[nameKey] = field;
    expressionAttributeValues[valueKey] = value;
  });

  const command = new UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  });

  await docClient.send(command);
}

export async function deleteItem(tableName: string, key: Record<string, any>): Promise<void> {
  const command = new DeleteCommand({
    TableName: tableName,
    Key: key,
  });
  await docClient.send(command);
}

export async function queryItems<T>(
  tableName: string,
  keyCondition: string,
  expressionValues: Record<string, any>,
  indexName?: string,
  limit?: number
): Promise<T[]> {
  const command = new QueryCommand({
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: keyCondition,
    ExpressionAttributeValues: expressionValues,
    Limit: limit,
  });
  const response = await docClient.send(command);
  return (response.Items as T[]) || [];
}

export async function scanItems<T>(
  tableName: string,
  filterExpression?: string,
  expressionValues?: Record<string, any>,
  limit?: number
): Promise<T[]> {
  const command = new ScanCommand({
    TableName: tableName,
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionValues,
    Limit: limit,
  });
  const response = await docClient.send(command);
  return (response.Items as T[]) || [];
}

export async function batchWrite(
  tableName: string,
  items: Record<string, any>[],
  operation: 'put' | 'delete' = 'put'
): Promise<void> {
  const BATCH_SIZE = 25;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const requestItems = batch.map((item) =>
      operation === 'put'
        ? { PutRequest: { Item: item } }
        : { DeleteRequest: { Key: item } }
    );

    const command = new BatchWriteCommand({
      RequestItems: {
        [tableName]: requestItems,
      },
    });

    await docClient.send(command);
  }
}

export async function batchGet<T>(
  tableName: string,
  keys: Record<string, any>[]
): Promise<T[]> {
  const BATCH_SIZE = 100;
  const results: T[] = [];

  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const batch = keys.slice(i, i + BATCH_SIZE);
    const command = new BatchGetCommand({
      RequestItems: {
        [tableName]: { Keys: batch },
      },
    });

    const response = await docClient.send(command);
    if (response.Responses?.[tableName]) {
      results.push(...(response.Responses[tableName] as T[]));
    }
  }

  return results;
}

export { tables };
