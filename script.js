// --- VARIABEL GLOBAL UNTUK PENYIMPANAN DATA ---
let halamanAktif = 'halaman-utama';
let keranjangPesanan = []; // Menyimpan daftar menu yang dipilih
let produkDipilih = null;  // Menyimpan data produk yang sedang dilihat detailnya
let jumlahItemDipilih = 1; // Jumlah kuantitas produk saat di halaman detail

// --- 1. FUNGSI NAVIGASI ANTAR HALAMAN (SPA) ---
function tampilkanHalaman(idHalaman) {
    // Sembunyikan semua halaman
    document.querySelectorAll('.halaman').forEach(halaman => {
        halaman.classList.add('hidden');
    });

    // Tampilkan halaman yang dipilih
    document.getElementById(idHalaman).classList.remove('hidden');
    halamanAktif = idHalaman;

    // Jika berpindah ke nota, perbarui tampilannya secara otomatis
    if (idHalaman === 'halaman-nota') {
        perbaruiTampilanNota();
    }
}

// --- 2. FUNGSI HALAMAN DETAIL PRODUK ---
function bukaDetail(nama, harga, gambar, deskripsi) {
    // Simpan data produk yang sedang diklik
    produkDipilih = { nama, harga, gambar };
    jumlahItemDipilih = 1; // Reset jumlah jadi 1 setiap buka detail baru

    // Masukkan data ke elemen HTML di halaman deskripsi
    document.getElementById('detail-img').src = gambar;
    document.getElementById('detail-nama').innerText = nama;
    document.getElementById('detail-harga').innerText = formatRupiah(harga);
    document.getElementById('detail-deskripsi').innerText = deskripsi;
    document.getElementById('jumlah-item').innerText = jumlahItemDipilih;
    document.getElementById('catatan-khusus').value = ''; // Kosongkan catatan lama

    // Pindah ke halaman deskripsi
    tampilkanHalaman('halaman-deskripsi');
}

function ubahJumlah(nilai) {
    jumlahItemDipilih += nilai;
    // Batasi minimal jumlah pesanan adalah 1
    if (jumlahItemDipilih < 1) {
        jumlahItemDipilih = 1;
    }
    document.getElementById('jumlah-item').innerText = jumlahItemDipilih;
}

// --- 3. FUNGSI KERANJANG & NOTA PEMBAYARAN ---
function tambahKeNota() {
    let catatan = document.getElementById('catatan-khusus').value;

    // Cek apakah produk yang sama dengan catatan yang sama sudah ada di keranjang
    let itemSudahAda = keranjangPesanan.find(item => 
        item.nama === produkDipilih.nama && item.catatan === catatan
    );

    if (itemSudahAda) {
        // Jika sudah ada, tambahkan jumlahnya saja
        itemSudahAda.jumlah += jumlahItemDipilih;
    } else {
        // Jika belum ada, masukkan sebagai item baru ke keranjang
        keranjangPesanan.push({
            nama: produkDipilih.nama,
            harga: produkDipilih.harga,
            gambar: produkDipilih.gambar,
            jumlah: jumlahItemDipilih,
            catatan: catatan
        });
    }

    // Perbarui total harga di floating bar halaman utama
    perbaruiFloatingBar();

    // Beri notifikasi kecil & kembali ke halaman utama
    alert("Berhasil ditambahkan ke pesanan!");
    tampilkanHalaman('halaman-utama');
}

function perbaruiFloatingBar() {
    let totalHargaSemua = 0;
    keranjangPesanan.forEach(item => {
        totalHargaSemua += (item.harga * item.jumlah);
    });

    document.getElementById('floating-total').innerText = formatRupiah(totalHargaSemua);
}

function perbaruiTampilanNota() {
    let containerNota = document.getElementById('daftar-nota');
    containerNota.innerHTML = '';

    if (keranjangPesanan.length === 0) {
        containerNota.innerHTML = '<p class="pesan-kosong">Belum ada pesanan yang dipilih.</p>';
        document.getElementById('nota-subtotal').innerText = formatRupiah(0);
        document.getElementById('nota-pajak').innerText = formatRupiah(0);
        document.getElementById('nota-total-akhir').innerText = formatRupiah(0);
        return;
    }

    let subtotal = 0;

    // Masukkan waktu real-time ke nota
    let sekarang = new Date();
    let jamWaktu = sekarang.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('waktu-pesan').innerText = jamWaktu;

    // Loop untuk menampilkan setiap item di nota
    keranjangPesanan.forEach((item, index) => {
        let totalItem = item.harga * item.jumlah;
        subtotal += totalItem;

        let htmlItem = `
            <div class="item-nota">
                <div class="item-nota-kiri">
                    <img src="${item.gambar}" alt="${item.nama}" class="item-nota-img">
                    <div>
                        <strong>${item.nama}</strong><br>
                        <small>${item.jumlah}x @ ${formatRupiah(item.harga)}</small>
                        ${item.catatan ? `<br><small style="color:#e74c3c;">Catatan: ${item.catatan}</small>` : ''}
                    </div>
                </div>
                <span>${formatRupiah(totalItem)}</span>
            </div>
        `;
        containerNota.innerHTML += htmlItem;
    });

    // Hitung Pajak (10%)
    let pajak = subtotal * 0.10;
    let totalAkhir = subtotal + pajak;

    // Tampilkan ke elemen nota
    document.getElementById('nota-subtotal').innerText = formatRupiah(subtotal);
    document.getElementById('nota-pajak').innerText = formatRupiah(pajak);
    document.getElementById('nota-total-akhir').innerText = formatRupiah(totalAkhir);
}

// --- 4. FUNGSI PENCARIAN & FILTER KATEGORI ---
document.getElementById('search-input').addEventListener('input', function(e) {
    let kataKunci = e.target.value.toLowerCase();
    let kartuMenu = document.querySelectorAll('.card-menu');

    kartuMenu.forEach(kartu => {
        let namaMenu = kartu.querySelector('h3').innerText.toLowerCase();
        if (namaMenu.includes(kataKunci)) {
            kartu.style.display = 'flex';
        } else {
            kartu.style.display = 'none';
        }
    });
});

function filterKategori(kategori) {
    // Ubah status tombol aktif di HTML
    document.querySelectorAll('.btn-kategori').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    let kartuMenu = document.querySelectorAll('.card-menu');
    kartuMenu.forEach(kartu => {
        let kategoriMenu = kartu.getAttribute('data-kategori');
        if (kategori === 'semua' || kategoriMenu === kategori) {
            kartu.style.display = 'flex';
        } else {
            kartu.style.display = 'none';
        }
    });
}

// --- 5. FUNGSI KONFIRMASI PESANAN AKHIR ---
function konfirmasiPesanan() {
    if (keranjangPesanan.length === 0) {
        alert("Keranjang pesanan masih kosong!");
        return;
    }

    let metode = document.getElementById('select-pembayaran').value;
    alert(`Pesanan berhasil dikirim ke dapur! Metode pembayaran: ${metode.toUpperCase()}. Mohon tunggu, pelayan akan segera datang atau silakan menuju kasir.`);
    
    // Reset keranjang setelah pesanan dikirim
    keranjangPesanan = [];
    perbaruiFloatingBar();
    tampilkanHalaman('halaman-utama');
}

// --- FUNGSI BANTUAN FORMAT MATA WANG RUPIAH ---
function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}
