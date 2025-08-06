#!/usr/bin/env node

// Script para verificar la configuración del proyecto
console.log('🔍 Verificando configuración del proyecto...\n');

import fs from 'fs';
import path from 'path';
import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const checks = [];

// 1. Verificar archivo .env
console.log('1️⃣ Verificando archivo .env...');
if (fs.existsSync('.env')) {
    console.log('   ✅ Archivo .env existe');
    checks.push({ name: '.env file', status: true });
} else {
    console.log('   ❌ Archivo .env no encontrado');
    console.log('   💡 Copia .env.example a .env y configúralo');
    checks.push({ name: '.env file', status: false });
}

// 2. Verificar variables de entorno esenciales
console.log('\n2️⃣ Verificando variables de entorno...');
const requiredVars = ['DB_HOST', 'DB_USER', 'DB_NAME', 'PORT'];
requiredVars.forEach(varName => {
    if (process.env[varName]) {
        console.log(`   ✅ ${varName}: ${process.env[varName]}`);
        checks.push({ name: varName, status: true });
    } else {
        console.log(`   ❌ ${varName}: No configurado`);
        checks.push({ name: varName, status: false });
    }
});

// 3. Verificar conexión a MySQL remoto
console.log('\n3️⃣ Verificando conexión a base de datos remota...');
try {
    const connection = await createConnection({
        host: process.env.DB_HOST || 'srv1009.hstgr.io',
        user: process.env.DB_USER || 'u465901502_admin',
        password: process.env.DB_PASSWORD || '@UTequipo2',
        database: process.env.DB_NAME || 'u465901502_joyeria',
        port: process.env.DB_PORT || 3306
    });
    
    await connection.execute('SELECT 1');
    console.log('   ✅ Conexión a base de datos remota exitosa');
    checks.push({ name: 'Remote MySQL Connection', status: true });
    await connection.end();
} catch (error) {
    console.log('   ❌ Error conectando a base de datos remota');
    console.log(`   💡 Error: ${error.message}`);
    console.log('   🌐 Verifica tu conexión a Internet');
    checks.push({ name: 'Remote MySQL Connection', status: false });
}

// 4. Verificar Stripe (opcional)
console.log('\n4️⃣ Verificando configuración de Stripe...');
if (process.env.STRIPE_SECRET_KEY) {
    console.log('   ✅ Stripe configurado');
    checks.push({ name: 'Stripe', status: true });
} else {
    console.log('   ⚠️ Stripe no configurado (opcional para desarrollo)');
    checks.push({ name: 'Stripe', status: 'optional' });
}

// 5. Verificar puerto disponible
console.log('\n5️⃣ Verificando puerto...');
const port = process.env.PORT || 5000;
console.log(`   🔍 Puerto configurado: ${port}`);

// Resumen
console.log('\n📊 RESUMEN DE VERIFICACIÓN');
console.log('=====================================');
const passed = checks.filter(c => c.status === true).length;
const failed = checks.filter(c => c.status === false).length;
const optional = checks.filter(c => c.status === 'optional').length;

console.log(`✅ Pasaron: ${passed}`);
console.log(`❌ Fallaron: ${failed}`);
console.log(`⚠️ Opcionales: ${optional}`);

if (failed === 0) {
    console.log('\n🎉 ¡Todo configurado correctamente!');
    console.log('💡 Puedes ejecutar: npm run dev');
} else {
    console.log('\n🔧 Configuración incompleta');
    console.log('💡 Revisa los elementos marcados con ❌');
    console.log('📖 Consulta SETUP.md para más información');
}
