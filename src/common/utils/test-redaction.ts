/**
 * Test file to demonstrate sensitive data redaction
 * This file should be deleted after testing
 */

import { ConfigService } from '@nestjs/config';
import { WinstonLoggerService } from '../logger/winston.config';

export function testRedaction() {
  const configService = new ConfigService();
  const logger = new WinstonLoggerService(configService);

  console.log('=== Testing Sensitive Data Redaction ===');

  // Test 1: Direct password logging
  logger.info('User registration attempt', {
    email: 'test@example.com',
    password: 'supersecret123',
    confirmPassword: 'supersecret123',
    firstName: 'John',
    lastName: 'Doe'
  });

  // Test 2: Authorization headers
  logger.info('API request with auth', {
    headers: {
      'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      'x-api-key': 'secret-api-key-12345',
      'content-type': 'application/json'
    }
  });

  // Test 3: Nested sensitive data
  logger.info('Complex object with secrets', {
    user: {
      id: 123,
      email: 'user@example.com',
      credentials: {
        password: 'hidden-password',
        apiKey: 'secret-key-value'
      }
    },
    metadata: {
      timestamp: new Date().toISOString(),
      sessionToken: 'session-12345-secret'
    }
  });

  // Test 4: Credit card information
  logger.info('Payment processing', {
    user_id: 123,
    credit_card: '4111111111111111',
    cvv: '123',
    amount: 29.99,
    currency: 'USD'
  });

  console.log('=== Redaction test completed - check logs ===');
}

// Only run if this file is executed directly
if (require.main === module) {
  testRedaction();
}