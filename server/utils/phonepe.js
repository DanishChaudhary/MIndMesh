const { StandardCheckoutClient, Env, MetaInfo, StandardCheckoutPayRequest } = require('pg-sdk-node');
const { randomUUID } = require('crypto');
require('dotenv').config();

// PhonePe SDK Configuration for Production
const CLIENT_ID = process.env.PHONEPE_CLIENT_ID;
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET;
const CLIENT_VERSION = parseInt(process.env.PHONEPE_CLIENT_VERSION) || 1;

// Always use PRODUCTION environment for production credentials
const env = Env.PRODUCTION;

// Validate required environment variables
if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('PhonePe configuration incomplete - Please add CLIENT_ID and CLIENT_SECRET from PhonePe Business Dashboard');
}


// Initialize PhonePe SDK Client
let phonePeClient = null;
try {
    phonePeClient = StandardCheckoutClient.getInstance(CLIENT_ID, CLIENT_SECRET, CLIENT_VERSION, env);
} catch (error) {
    throw new Error('PhonePe SDK initialization failed');
}

async function createPayment(merchantTransactionId, amountPaise, merchantUserId = 'guest', redirectUrl, mobileNumber = '9999999999') {
    try {
        // Validate input parameters
        if (!merchantTransactionId || !amountPaise || !redirectUrl) {
            throw new Error('Missing required parameters: merchantTransactionId, amountPaise, or redirectUrl');
        }

        if (amountPaise < 100) { // Minimum 1 rupee
            throw new Error('Amount must be at least 100 paise (1 rupee)');
        }

        // Build MetaInfo with user details
        const metaInfo = MetaInfo.builder()
            .udf1(String(merchantUserId))
            .udf2(String(mobileNumber))
            .build();

        // Build payment request using SDK (webhookUrl not supported in this SDK version)
        const request = StandardCheckoutPayRequest.builder()
            .merchantOrderId(String(merchantTransactionId))
            .amount(Number(amountPaise))
            .redirectUrl(redirectUrl)
            .metaInfo(metaInfo)
            .build();

        // Initiate payment using SDK
        const response = await phonePeClient.pay(request);

        return {
            success: true,
            redirectUrl: response.redirectUrl,
            raw: {
                state: response.state,
                orderId: response.orderId,
                expireAt: response.expireAt
            }
        };
    } catch (err) {
        return { 
            success: false, 
            error: err.message || 'Payment initiation failed',
            raw: err
        };
    }
}

async function checkStatus(merchantTransactionId) {
    try {
        if (!merchantTransactionId) {
            throw new Error('merchantTransactionId is required');
        }


        // Use SDK to check order status
        const response = await phonePeClient.getOrderStatus(merchantTransactionId);

        return { 
            success: true, 
            raw: {
                state: response.state,
                orderId: response.orderId,
                amount: response.amount,
                paymentDetails: response.paymentDetails
            }
        };
    } catch (err) {
        return { 
            success: false, 
            error: err.message || 'Status check failed',
            raw: err
        };
    }
}

module.exports = { createPayment, checkStatus };


