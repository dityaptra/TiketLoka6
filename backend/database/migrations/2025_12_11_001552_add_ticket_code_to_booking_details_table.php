<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('booking_details', function (Blueprint $table) {
        // Tambah kolom ticket_code yang unik
        $table->string('ticket_code')->after('destination_id')->unique()->nullable();
    });
}

public function down()
{
    Schema::table('booking_details', function (Blueprint $table) {
        $table->dropColumn('ticket_code');
    });
}
};