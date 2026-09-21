import amqplib from 'amqplib';
export async function getQueue() {
    const queueUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    const queueName = "tasks";
    const conn = await amqplib.connect(queueUrl);
    const channel = await conn.createChannel();
    await channel.assertQueue(queueName, { durable: true });
    return channel;
}
