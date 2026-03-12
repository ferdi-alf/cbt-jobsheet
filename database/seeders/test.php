<?php
$conn = mysqli_connect("localhost", "root", "", "pengaduan_db");

function ambilData($query) {
    global $conn;
    $res = mysqli_query($conn, $query);
    $rows = [];
    while ($row = mysqli_fetch_assoc($res)) {
        $rows[] = $row;
    }
    return $rows;
}

function kirimLaporan($data) {
    global $conn;
    $nis = htmlspecialchars($data["nis"]);
    $kat = htmlspecialchars($data["id_kategori"]);
    $lok = htmlspecialchars($data["lokasi"]);
    $ket = htmlspecialchars($data["ket"]);
    mysqli_query($conn, "INSERT INTO input_aspirasi (nis, id_kategori, lokasi, ket) VALUES ('$nis', '$kat', '$lok', '$ket')");
    $id_baru = mysqli_insert_id($conn);
    mysqli_query($conn, "INSERT INTO aspirasi (id_laporan, status) VALUES ('$id_baru', 'Pending')");
    return mysqli_affected_rows($conn);
}