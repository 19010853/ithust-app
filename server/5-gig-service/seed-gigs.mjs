/**
 * seed-gigs.mjs
 * Nạp dữ liệu từ file gigs.json vào MongoDB (qua mongoose) + Elasticsearch.
 *
 * Cách chạy (từ thư mục 5-gig-service):
 *   node seed-gigs.mjs "<đường_dẫn_file_gigs.json>"
 *
 * Ví dụ (Windows):
 *   node seed-gigs.mjs "C:/Users/Admin/Downloads/gigs (1).json"
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import mongoose from 'mongoose';
import { Client as ESClient } from '@elastic/elasticsearch';

// ── Cấu hình (đồng bộ với .env của gig-service) ──────────────
const MONGO_URI = 'mongodb://127.0.0.1:27017/ithust-gig';
const ES_URL    = 'http://elastic:admin1234@localhost:9200';
const ES_INDEX  = 'gigs';

// ── Mongoose Schema (giống gig.schema.ts) ─────────────────────
const gigSchema = new mongoose.Schema(
  {
    sellerId:         { type: mongoose.Schema.Types.ObjectId },
    username:         { type: String, default: '' },
    profilePicture:   { type: String, default: '' },
    email:            { type: String, default: '' },
    title:            { type: String, default: '' },
    description:      { type: String, default: '' },
    categories:       { type: String, default: '' },
    subCategories:    [String],
    tags:             [String],
    active:           { type: Boolean, default: true },
    expectedDelivery: { type: String, default: '' },
    basicTitle:       { type: String, default: '' },
    basicDescription: { type: String, default: '' },
    ratingsCount:     { type: Number, default: 0 },
    ratingSum:        { type: Number, default: 0 },
    ratingCategories: { type: mongoose.Schema.Types.Mixed, default: {} },
    price:            { type: Number, default: 0 },
    sortId:           { type: Number, default: 0 },
    coverImage:       { type: String, default: '' },
    createdAt:        { type: Date, default: Date.now }
  },
  { versionKey: false }
);

const GigModel = mongoose.model('Gig', gigSchema, 'gigs');

// ── Main ──────────────────────────────────────────────────────
async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('❌  Thiếu đường dẫn file JSON.');
    console.error('    Cách dùng: node seed-gigs.mjs "<path/to/gigs.json>"');
    process.exit(1);
  }

  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`❌  Không tìm thấy file: ${absPath}`);
    process.exit(1);
  }

  // ── Đọc từng dòng JSON ────────────────────────────────────────
  const rl = readline.createInterface({
    input: fs.createReadStream(absPath),
    crlfDelay: Infinity
  });

  const gigs = [];
  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line);
      // Format ES: { _id, _source: {...} }
      const esId = parsed._id;
      const src  = parsed._source ?? parsed;
      gigs.push({ esId, data: src });
    } catch (e) {
      console.warn('⚠️  Bỏ qua dòng lỗi JSON:', e.message);
    }
  }

  if (gigs.length === 0) {
    console.error('❌  Không có dữ liệu hợp lệ trong file.');
    process.exit(1);
  }

  console.log(`\n📂  Đọc được ${gigs.length} gigs từ file.\n`);

  // ── Kết nối MongoDB ───────────────────────────────────────────
  await mongoose.connect(MONGO_URI);
  console.log('✅  Kết nối MongoDB thành công.');

  // ── Kết nối Elasticsearch ─────────────────────────────────────
  const esClient = new ESClient({ node: ES_URL });
  await esClient.ping();
  console.log('✅  Kết nối Elasticsearch thành công.');

  // Tạo index nếu chưa có
  const indexExists = await esClient.indices.exists({ index: ES_INDEX });
  if (!indexExists) {
    await esClient.indices.create({ index: ES_INDEX });
    console.log(`📁  Tạo ES index "${ES_INDEX}" mới.`);
  }
  console.log('');

  // ── Upsert từng gig ───────────────────────────────────────────
  let successMongo = 0;
  let successES    = 0;
  let errors       = 0;

  for (let i = 0; i < gigs.length; i++) {
    const { esId, data } = gigs[i];
    const title = data.title?.slice(0, 45) ?? 'N/A';
    process.stdout.write(`\r🔄  [${i + 1}/${gigs.length}] ${title.padEnd(46)}`);

    // ── MongoDB upsert ──────────────────────────────────────────
    const mongoDoc = {
      ...data,
      sellerId:  data.sellerId  ? new mongoose.Types.ObjectId(data.sellerId)  : undefined,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
    };
    delete mongoDoc.id; // xoá field "id" dư thừa từ ES

    try {
      await GigModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(esId),
        { $set: mongoDoc },
        { upsert: true, new: true }
      );
      successMongo++;
    } catch (e) {
      console.error(`\n   ⚠️  MongoDB lỗi [${esId}]: ${e.message}`);
      errors++;
    }

    // ── Elasticsearch index ────────────────────────────────────
    try {
      await esClient.index({
        index: ES_INDEX,
        id:    esId,
        document: { ...data }
      });
      successES++;
    } catch (e) {
      console.error(`\n   ⚠️  ES lỗi [${esId}]: ${e.message}`);
    }
  }

  // Refresh để search ngay lập tức
  await esClient.indices.refresh({ index: ES_INDEX });

  console.log(`\n\n${'─'.repeat(50)}`);
  console.log(`✅  Hoàn tất seeding!`);
  console.log(`   MongoDB       : ${successMongo}/${gigs.length} gigs`);
  console.log(`   Elasticsearch : ${successES}/${gigs.length} gigs`);
  if (errors > 0) console.log(`   Lỗi          : ${errors} gigs`);
  console.log(`${'─'.repeat(50)}\n`);

  await mongoose.disconnect();
  console.log('🎉  Script hoàn thành!\n');
}

main().catch((err) => {
  console.error('\n❌  Lỗi:', err.message);
  process.exit(1);
});
