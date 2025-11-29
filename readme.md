# 🔧 Triforge Tech – Backend API

Backend ini adalah REST API untuk website **Triforge Tech** yang menangani:

- Manajemen **admin / user** (akun operator dashboard)
- Manajemen **segment / kategori layanan**
- Manajemen **project portofolio** (termasuk upload gambar ke Cloudinary / URL)
- Manajemen **contact message / lead** dari form kontak (dengan status sudah dibaca)
- Endpoint **dashboard admin** (overview metric & data terbaru)

Dibangun dengan stack modern: **Express.js + Prisma + PostgreSQL (Neon)** dan siap di-deploy ke platform Node.js apa pun.

---

## 🧱 Tech Stack

- **Runtime**: Node.js (Express.js)
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon DB)
- **Validasi**: Zod (mis. untuk `contactSchema`)
- **Auth**: JWT (token disimpan di cookie untuk admin)
- **File Upload**: Multer (atau sejenis) + Cloudinary (untuk gambar project)
- **Environment**: `.env` (DATABASE_URL, JWT_SECRET, dsb.)

---

## 📁 Struktur Folder (Ringkas)

> Sesuaikan dengan struktur aktual kamu, ini versi yang sejalan dengan kode yang sudah kita kerjakan.

```bash
backend/
├─ prisma/
│  ├─ schema.prisma          # Definisi schema Prisma
│  └─ migrations/            # File migrasi
│
├─ src/
│  ├─ config/
│  │  └─ db.js               # Inisialisasi PrismaClient
│  │
│  ├─ middlewares/
│  │  ├─ auth.js             # Middleware auth admin (cek JWT)
│  │  └─ errorHandler.js     # Global error handler (opsional)
│  │
│  ├─ modules/
│  │  ├─ user/
│  │  │  ├─ user.controller.js
│  │  │  ├─ user.routes.js
│  │  │  └─ user.schema.js   # (opsional, jika pakai Zod)
│  │  │
│  │  ├─ segment/
│  │  │  ├─ segment.controller.js
│  │  │  ├─ segment.routes.js
│  │  │  └─ segment.schema.js
│  │  │
│  │  ├─ project/
│  │  │  ├─ project.controller.js
│  │  │  ├─ project.routes.js
│  │  │  └─ project.schema.js
│  │  │
│  │  ├─ contact/
│  │  │  ├─ contact.controller.js
│  │  │  ├─ contact.routes.js
│  │  │  └─ contact.schema.js
│  │  │
│  │  └─ admin/
│  │     ├─ admin.controller.js   # /api/admin/dashboard, dll.
│  │     └─ admin.routes.js
│  │
│  ├─ routes/
│  │  └─ index.js             # Menggabungkan semua route module
│  │
│  ├─ utils/
│  │  ├─ jwt.js               # generate/verify token
│  │  └─ cloudinary.js        # helper upload ke Cloudinary
│  │
│  └─ server.js               # Inisialisasi Express, middleware, route utama
│
├─ .env                       # Konfigurasi environment
├─ package.json
└─ README.md
```

---

## ⚙️ Konfigurasi Environment

Buat file `.env` di root backend, misalnya:

```env
# Database Neon
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"

# JWT
JWT_SECRET="ganti_dengan_secret_yang_kuat"
JWT_EXPIRES_IN="7d"

# Server
PORT=4000
NODE_ENV=development

# CORS (sesuaikan dengan origin frontend)
CORS_ORIGIN="http://localhost:5173"

# Cloudinary (untuk gambar project)
CLOUDINARY_CLOUD_NAME="nama_cloud_kamu"
CLOUDINARY_API_KEY="apikey"
CLOUDINARY_API_SECRET="apisecret"
```

---

## 🗄️ Prisma & Database

Schema utama (contoh ringkas, sesuaikan dengan punyamu):

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  name         String?
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Segment {
  id       Int       @id @default(autoincrement())
  slug     String    @unique
  label    String
  projects Project[]
}

model Project {
  id        Int      @id @default(autoincrement())
  segment   Segment  @relation(fields: [segmentId], references: [id])
  segmentId Int

  category  String
  title     String
  result    String
  details   String
  tags      String   // JSON string array
  image     String
  imageAlt  String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ContactMessage {
  id        Int      @id @default(autoincrement())
  name      String
  email     String
  whatsapp  String?
  message   String

  // Status sudah dibaca di dashboard admin
  isRead    Boolean  @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Menjalankan Migrasi

```bash
# Generate client
npx prisma generate

# Jalankan migrasi ke Neon (local dev)
npx prisma migrate dev --name init_schema

# Di environment production (server):
npx prisma migrate deploy
```

---

## 🚀 Instalasi & Menjalankan

```bash
# 1. Install dependency
npm install

# 2. Setup .env (DATABASE_URL, JWT_SECRET, dsb.)

# 3. Prisma generate & migrate
npx prisma generate
npx prisma migrate dev --name init_schema

# 4. Jalankan server (lihat script di package.json)
npm run dev   # biasanya dengan nodemon
# atau
npm start     # untuk mode production
```

Server default berjalan di `http://localhost:4000` (atau sesuai `PORT` di `.env`).

---

## 🔐 Otentikasi & Admin

- Admin login (endpoint bisa saja: `POST /api/admin/login` – sesuaikan dengan implementasi kamu).
- Setelah login:

  - Backend mengembalikan **JWT** dan menyimpannya di **cookie** (httpOnly).
  - Frontend admin akan memanggil endpoint lain (contoh: `/api/admin/dashboard`, `/api/users`, dst.) dengan cookie tersebut.

Contoh pola fungsi auth di backend (gambaran):

- `POST /api/admin/login` → cek email & password, generate JWT, simpan di cookie.
- `GET /api/admin/me` → baca token dari cookie, kembalikan data admin.
- Middleware `requireAdmin` → dipasang di route-route admin.

Semua endpoint manajemen (users, segments, projects, contacts, dashboard) sebaiknya dilindungi dengan middleware auth admin.

---

## 📊 Admin Dashboard Endpoint

### `GET /api/admin/dashboard`

Mengembalikan payload ringkas untuk halaman dashboard:

```ts
interface AdminDashboardMetrics {
  totalProjects: number;
  totalSegments: number;
  totalContacts: number;
  projectsBySegment: {
    segmentId: number;
    segmentSlug: string;
    segmentLabel: string;
    count: number;
  }[];
}

interface AdminDashboardProjectSummary {
  id: number;
  segment: string;
  segmentLabel: string;
  category: string;
  title: string;
  createdAt: string;
}

interface AdminDashboardContactSummary {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  message: string;
  createdAt: string;
}

interface AdminDashboardPayload {
  me: {
    id: number;
    email: string;
    name?: string;
  };
  metrics: AdminDashboardMetrics;
  recentProjects: AdminDashboardProjectSummary[];
  recentContacts: AdminDashboardContactSummary[];
}
```

---

## 👤 Users API (`/api/users`)

CRUD untuk akun admin / operator.

- `GET /api/users`
  List semua user.

- `POST /api/users`
  Buat user baru.

  ```json
  {
    "email": "admin@example.com",
    "password": "rahasia123",
    "name": "Nama Admin"
  }
  ```

- `PUT /api/users/:id`
  Update sebagian field (name, email, password).

- `DELETE /api/users/:id`
  Hapus user.

Endpoint ini dipanggil oleh halaman **AdminUsersPage** di frontend.

---

## 🧩 Segments API (`/api/segments`)

Mengelola kategori layanan / segment.

- `GET /api/segments`
  Mengembalikan array segment (`id` numerik, `slug`, `label`).
- `POST /api/segments`

  ```json
  { "slug": "web-app", "label": "Web App & Sistem" }
  ```

- `PUT /api/segments/:idOrSlug`
  Update label.
- `DELETE /api/segments/:idOrSlug`
  Hapus segment (harus dipastikan tidak sedang dipakai project, atau tangani di backend).

Frontend:

- Halaman **AdminSegmentsPage**
- Filter di **AdminProjectsPage** juga menggunakan data segments.

---

## 📁 Projects API (`/api/projects`)

Mengelola project portofolio (terintegrasi dengan segment).

- `GET /api/projects`
  List semua project.

- `GET /api/projects?segment=web-app`
  Filter berdasarkan segment (slug/id).

- `POST /api/projects`
  Menerima **FormData** (karena ada file):

  - `segment` (slug/id)
  - `category`
  - `title`
  - `result`
  - `details`
  - `tags` (JSON string array)
  - `image`:

    - bisa file upload (ditangani Multer → upload ke Cloudinary → simpan URL)
    - atau berisi string URL langsung

  - `imageAlt`

- `PUT /api/projects/:id`
  Update sebagian data project (termasuk ganti gambar).

- `DELETE /api/projects/:id`
  Hapus project.

Frontend:

- Halaman **AdminProjectsPage** memanggil endpoint ini dengan FormData, upload gambar ke backend, lalu backend yang menyimpan ke Cloudinary.

---

## ✉️ Contact API (`/api/contact`)

Menangani pesan dari form kontak dan pengelolaannya di dashboard admin.

### Public (Website)

- `POST /api/contact`

  Body (divalidasi oleh `contactSchema` / Zod):

  ```json
  {
    "name": "Nama Client",
    "email": "client@mail.com",
    "whatsapp": "628123xxxxxxx",
    "message": "Kebutuhan project / brief singkat..."
  }
  ```

  Response:

  ```json
  {
    "message": "Pesan terkirim",
    "id": 1
  }
  ```

### Admin

- `GET /api/contact`
  List semua contact message, `orderBy createdAt desc`.
  Termasuk field:

  ```ts
  interface Contact {
    id: number;
    name: string;
    email: string;
    whatsapp?: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
  }
  ```

- `GET /api/contact/:id`
  Detail satu pesan.

- `PUT /api/contact/:id`
  Partial update, misalnya koreksi message dan/atau tandai sudah dibaca:

  ```json
  {
    "message": "Catatan internal / hasil follow up",
    "isRead": true
  }
  ```

- `DELETE /api/contact/:id`
  Hapus pesan.

Frontend:

- Halaman **AdminContactsPage**:

  - Menampilkan list contact dengan badge **“Read / Unread”** berdasarkan `isRead`.
  - Saat admin membuka detail, bisa:

    - update isi message (misalnya isi catatan follow-up),
    - set `isRead: true`,
    - dan menghapus contact bila perlu.

---

## 🧪 Testing API (Thunder Client / Postman)

1. Import collection (kalau sudah dibuat) atau buat manual:

   - Folder: `Auth`, `Users`, `Segments`, `Projects`, `Contact`, `Admin Dashboard`.

2. Set environment:

   - `{{baseUrl}} = http://localhost:4000`

3. Urutan uji coba:

   1. **Auth**: login sebagai admin → simpan cookie/token.
   2. **Users**: buat 1–2 admin lain (opsional).
   3. **Segments**: buat beberapa segment (`web-app`, `ai-automation`, dll.).
   4. **Projects**: test create project + upload gambar.
   5. **Contact**:

      - `POST /api/contact` dari tab Thunder Client (simulasi website).
      - `GET /api/contact` untuk cek di admin.
      - `PUT /api/contact/:id` → set `isRead: true`.

   6. **Admin Dashboard**: `GET /api/admin/dashboard` → cek metrics & list terbaru.

---

## 🧩 Catatan Tambahan

- **Prisma**: setiap kali mengubah `schema.prisma`, jalankan:

  ```bash
  npx prisma generate
  npx prisma migrate dev --name some_change
  ```

- **Neon DB**:

  - Pastikan `DATABASE_URL` sudah memakai connection string dari Neon dengan SSL.
  - Bisa cek tabel via Neon console (web).

- **Deployment**:

  - Bisa pakai Render / Railway / VPS / platform lain yang mendukung Node + long-running process.
  - Jalankan `npm ci`, `npx prisma migrate deploy`, lalu `npm start`.

---

## 📌 Lisensi & Penggunaan

Backend ini dikembangkan untuk kebutuhan internal brand **Triforge Tech** dan project pribadi.
Silakan modifikasi sesuai kebutuhan produksi / portofolio kamu.
