/* global monogatari */

const DEFAULT_LEADERSHIP_STATS = {
	popularitas: 50,
	integritas: 50,
	danaAnggaran: 50
};

const ACT2_EVENTS_BEFORE_ACT3 = 5;

function leadershipStats () {
	return Object.assign (
		{},
		DEFAULT_LEADERSHIP_STATS,
		monogatari.storage ('stats') || {}
	);
}

function clampStat (value) {
	return Math.max (0, Math.min (100, value));
}

function updateLeadershipStatsUI () {
	const stats = leadershipStats ();
	const panel = document.querySelector ('[data-ui="leadership-stats"]');

	if (panel === null) {
		return;
	}

	panel.querySelector ('[data-stat="popularitas"]').textContent = stats.popularitas;
	panel.querySelector ('[data-stat="integritas"]').textContent = stats.integritas;
	panel.querySelector ('[data-stat="danaAnggaran"]').textContent = stats.danaAnggaran;
	panel.querySelector ('[data-stat-bar="popularitas"]').style.width = `${clampStat (stats.popularitas)}%`;
	panel.querySelector ('[data-stat-bar="integritas"]').style.width = `${clampStat (stats.integritas)}%`;
	panel.querySelector ('[data-stat-bar="danaAnggaran"]').style.width = `${clampStat (stats.danaAnggaran)}%`;
}

function setupLeadershipStatsUI () {
	const gameScreen = document.querySelector ('game-screen');

	if (gameScreen === null || document.querySelector ('[data-ui="leadership-stats"]') !== null) {
		return;
	}

	const panel = document.createElement ('aside');
	panel.dataset.ui = 'leadership-stats';
	panel.innerHTML = `
		<div class="stat-card">
			<span>Popularitas</span>
			<strong><span data-stat="popularitas">50</span></strong>
			<div class="stat-meter"><span data-stat-bar="popularitas"></span></div>
		</div>
		<div class="stat-card">
			<span>Integritas</span>
			<strong><span data-stat="integritas">50</span></strong>
			<div class="stat-meter"><span data-stat-bar="integritas"></span></div>
		</div>
		<div class="stat-card">
			<span>Dana Anggaran</span>
			<strong><span data-stat="danaAnggaran">50</span></strong>
			<div class="stat-meter"><span data-stat-bar="danaAnggaran"></span></div>
		</div>
	`;

	gameScreen.appendChild (panel);
	updateLeadershipStatsUI ();
}

function setLeadershipStats (changes) {
	monogatari.storage ({
		stats: Object.assign ({}, leadershipStats (), changes)
	});
	updateLeadershipStatsUI ();
}

function adjustLeadershipStats (changes) {
	const stats = leadershipStats ();
	const nextStats = Object.assign ({}, stats);

	Object.keys (changes).forEach ((key) => {
		nextStats[key] = clampStat ((stats[key] || 0) + changes[key]);
	});

	setLeadershipStats (nextStats);
}

function hasFailedLeadershipStats () {
	const stats = leadershipStats ();

	return stats.popularitas <= 0 || stats.integritas <= 0 || stats.danaAnggaran <= 0;
}

function act2Progress () {
	return Object.assign (
		{ resolvedEvents: 0 },
		monogatari.storage ('act2') || {}
	);
}

function resetAct2Progress () {
	monogatari.storage ({
		act2: {
			resolvedEvents: 0
		}
	});
}

function adjustAct2Progress (change) {
	const progress = act2Progress ();

	monogatari.storage ({
		act2: {
			resolvedEvents: Math.max (0, progress.resolvedEvents + change)
		}
	});
}

function shouldEnterAct3 () {
	return act2Progress ().resolvedEvents >= ACT2_EVENTS_BEFORE_ACT3;
}

function finalEndingBranch () {
	const stats = leadershipStats ();

	if (stats.popularitas >= 70 && stats.integritas >= 70 && stats.danaAnggaran >= 30) {
		return 'Ending1';
	} else if (stats.danaAnggaran >= 70 && stats.popularitas >= 40) {
		return 'Ending2';
	}

	return 'Ending3';
}

function applyStatChanges (changes) {
	return {
		'Function': {
			'Apply': function () {
				adjustLeadershipStats (changes);
				return true;
			},
			'Revert': function () {
				const revertChanges = {};

				Object.keys (changes).forEach ((key) => {
					revertChanges[key] = -changes[key];
				});

				adjustLeadershipStats (revertChanges);
				return true;
			}
		}
	};
}

window.updateLeadershipStatsUI = updateLeadershipStatsUI;
window.setLeadershipStats = setLeadershipStats;
window.adjustLeadershipStats = adjustLeadershipStats;
window.hasFailedLeadershipStats = hasFailedLeadershipStats;
window.finalEndingBranch = finalEndingBranch;

document.addEventListener ('DOMContentLoaded', () => {
	setupLeadershipStatsUI ();
});

monogatari.action ('message').messages ({
	'Help': {
		title: 'Bantuan',
		subtitle: 'Masa Jabatan 5 Tahun',
		body: `
			<p>Gunakan keputusan cerita untuk menjaga Popularitas, Integritas, dan Dana Anggaran tetap stabil.</p>
		`
	}
});

monogatari.action ('notification').notifications ({
	'Welcome': {
		title: 'Masa Jabatan Dimulai',
		body: 'Tiga pilar kepemimpinan sudah aktif.',
		icon: ''
	},
	'PopularitasUp': {
		title: 'Popularitas Naik',
		body: 'Warga merespons pidato Anda dengan antusias.',
		icon: ''
	},
	'IntegritasUp': {
		title: 'Integritas Naik',
		body: 'Audit awal memberi sinyal pemerintahan yang bersih.',
		icon: ''
	},
	'Act2OptionA': {
		title: 'Popularitas Naik',
		body: 'Warga melihat Anda bergerak cepat, tetapi anggaran ikut terkuras.',
		icon: ''
	},
	'Act2OptionB': {
		title: 'Integritas Naik',
		body: 'Keputusan tertib administrasi memperkuat kepercayaan internal dan posisi dana.',
		icon: ''
	}
});

monogatari.action ('particles').particles ({

});

monogatari.action ('canvas').objects ({

});

monogatari.configuration ('credits', {

});

monogatari.assets ('gallery', {

});

monogatari.assets ('music', {

});

monogatari.assets ('voices', {

});

monogatari.assets ('sounds', {

});

monogatari.assets ('videos', {

});

monogatari.assets ('images', {

});

monogatari.assets ('scenes', {
	governor_office_morning: 'governor_office_morning.png',
	west_bridge_collapse: 'west_bridge_collapse.png',
	press_conference_room: 'press_conference_room.png',
	election_night_office: 'election_night_office.png',
	victory_balcony: 'victory_balcony.png',
	elite_takeover_room: 'elite_takeover_room.png',
	bankrupt_city_hall: 'bankrupt_city_hall.png'
});

monogatari.characters ({
	arya: {
		name: 'Arya',
		color: '#f5c16c',
		sprites: {
			neutral: 'arya_neutral.png',
			thinking: 'arya_thinking.png',
			concerned: 'arya_concerned.png',
			determined: 'arya_determined.png'
		}
	},
	maya: {
		name: 'Maya',
		color: '#7fc7ff',
		sprites: {
			neutral: 'maya_neutral.png',
			slight_smile: 'maya_slight_smile.png',
			serious: 'maya_serious.png',
			urgent: 'maya_urgent.png'
		}
	}
});

monogatari.script ({
	'Start': [
		{
			'Function': {
				'Apply': function () {
					setLeadershipStats (DEFAULT_LEADERSHIP_STATS);
					resetAct2Progress ();
					setupLeadershipStatsUI ();
					return true;
				},
				'Revert': function () {
					return true;
				}
			}
		},
		'jump Act1Pelantikan'
	],

	'Act1Pelantikan': [
		'show scene governor_office_morning with fadeIn',
		'show notification Welcome',
		'show character arya thinking at left with fadeIn',
		'arya Cahaya pagi masuk lewat jendela besar kantor gubernur. Di meja, papan nama berlapis emas itu seperti menatap balik: Gubernur Arya.',
		'arya Aku menang. Tapi tumpukan dokumen di depanku membuat kursi ini terasa lebih seperti kursi panas daripada takhta.',
		'arya Lima tahun. Cukup lama untuk mengubah kota ini, atau menghancurkan hidupku sendiri.',
		'show character maya neutral at right with fadeIn',
		'maya Selamat pagi, Pak Gubernur. Saya Maya, Kepala Staf Anda untuk lima tahun ke depan.',
		'maya Saya harap Anda sudah menikmati kopi pertama Anda, karena jadwal kita sangat padat.',
		'show character arya neutral at left',
		'arya Selamat pagi, Maya. Duduklah. Langsung saja, badai apa yang harus saya hadapi di hari pertama ini?',
		'show character maya slight_smile at right',
		'maya Sebagai permulaan, Anda harus memahami bahwa di ruangan ini, setiap tanda tangan memiliki konsekuensi.',
		'jump Act1TutorialStats'
	],

	'Act1TutorialStats': [
		'show character maya serious at right',
		'maya Ada tiga pilar utama yang menentukan kelangsungan karier Anda.',
		'maya Popularitas: kepercayaan warga. Integritas: ketaatan pada hukum dan moral. Dana Anggaran: kas daerah yang membuat semua program tetap bergerak.',
		'maya Panel di layar akan menampilkan angka ketiganya. Saat ini semuanya mulai dari 50.',
		'arya Jadi setiap keputusan akan mengangkat satu hal dan mungkin menjatuhkan hal lain.',
		'maya Tepat. Dan politik jarang memberi hadiah tanpa tagihan.',
		'maya Untuk latihan pertama, saya sudah menyiapkan jadwal internal. Anda hanya bisa memilih satu.',
		{
			'Choice': {
				'Dialog': 'maya Kita mulai dari mana, Pak?',
				'PublicSpeaking': {
					'Text': 'Latihan Public Speaking (+Popularitas)',
					'Do': 'jump Act1PublicSpeaking'
				},
				'AuditMandiri': {
					'Text': 'Audit Mandiri (+Integritas)',
					'Do': 'jump Act1AuditMandiri'
				}
			}
		}
	],

	'Act1PublicSpeaking': [
		'show character arya determined at left',
		'arya Kalau rakyat tidak percaya pada suara pemimpinnya, kebijakan terbaik pun akan mati di jalan.',
		{
			'Function': {
				'Apply': function () {
					adjustLeadershipStats ({ popularitas: 10 });
					return true;
				},
				'Revert': function () {
					adjustLeadershipStats ({ popularitas: -10 });
					return true;
				}
			}
		},
		'show notification PopularitasUp',
		'maya Keputusan dicatat. Popularitas Anda naik karena tim komunikasi punya pesan yang lebih tajam untuk publik.',
		'jump Act1AfterTutorialChoice'
	],

	'Act1AuditMandiri': [
		'show character arya concerned at left',
		'arya Aku ingin tahu ke mana setiap rupiah mengalir sebelum orang lain menjadikannya senjata.',
		{
			'Function': {
				'Apply': function () {
					adjustLeadershipStats ({ integritas: 10 });
					return true;
				},
				'Revert': function () {
					adjustLeadershipStats ({ integritas: -10 });
					return true;
				}
			}
		},
		'show notification IntegritasUp',
		'maya Keputusan dicatat. Integritas Anda naik karena staf melihat Anda serius memeriksa anggaran sejak hari pertama.',
		'jump Act1AfterTutorialChoice'
	],

	'Act1AfterTutorialChoice': [
		'show character maya neutral at right',
		'maya Itu baru latihan, Pak. Mulai besok, pilihan Anda tidak akan serapi dua opsi di kalender.',
		'maya Pagi ini serikat buruh sudah berkumpul menuntut janji kampanye kenaikan upah. Pengusaha mengancam menarik investasi jika tuntutan itu dikabulkan.',
		'show character arya thinking at left',
		'arya Tidak ada jalan tengah yang bisa membuat kedua belah pihak diam?',
		'show character maya serious at right',
		'maya Di politik, memuaskan semua orang sama saja dengan bunuh diri pelan-pelan.',
		'maya Silakan bersiap, Pak. Lima tahun masa jabatan Anda resmi dimulai... sekarang.',
		'jump Act2Intro'
	],

	'Act2Intro': [
		'show scene governor_office_morning with fadeIn',
		'show character maya serious at right',
		'show character arya neutral at left',
		'maya Tahun kedua sampai keempat akan bergerak lebih cepat, Pak.',
		'maya Setiap pagi saya akan membawa satu dilema harian. Masalahnya bisa muncul dari jalan rusak, penertiban warga, sampai krisis layanan publik.',
		'arya Jadi rutinitasnya sederhana: dengar briefing, ambil keputusan, lalu hidup dengan konsekuensinya.',
		'maya Sederhana di atas kertas. Melelahkan di dunia nyata.',
		'jump Act2DailyLoop'
	],

	'Act2DailyLoop': [
		'show scene governor_office_morning with fadeIn',
		'show character maya neutral at right',
		'show character arya thinking at left',
		'maya Briefing pagi siap, Pak. Sistem akan memilih satu dilema harian dari laporan yang masuk.',
		{
			'Conditional': {
				'Condition': function () {
					const events = [
						'JalanBerlubang',
						'PenggusuranPKL',
						'KrisisAirBersih'
					];

					return events[Math.floor (Math.random () * events.length)];
				},
				'JalanBerlubang': 'jump Act2JalanBerlubang',
				'PenggusuranPKL': 'jump Act2PenggusuranPKL',
				'KrisisAirBersih': 'jump Act2KrisisAirBersih'
			}
		}
	],

	'Act2JalanBerlubang': [
		'show character maya serious at right',
		'maya Laporan pertama: video warga memancing ikan di jalan berlubang sudah viral. Media menunggu respons Anda.',
		'arya Satu lubang di aspal, satu lubang di kepercayaan publik.',
		{
			'Choice': {
				'Dialog': 'maya Keputusan Anda?',
				'OpsiA': {
					'Text': 'Opsi A: Perbaiki sekarang dengan dana darurat (+Popularitas, -Dana)',
					'Do': 'jump Act2JalanBerlubangA'
				},
				'OpsiB': {
					'Text': 'Opsi B: Audit kontraktor dulu dan tahan pembayaran (+Integritas, +Dana)',
					'Do': 'jump Act2JalanBerlubangB'
				}
			}
		}
	],

	'Act2PenggusuranPKL': [
		'show character maya serious at right',
		'maya Satpol PP meminta izin menertibkan PKL di koridor utama. Pedagang meminta relokasi yang lebih manusiawi.',
		'arya Ketertiban kota selalu terlihat mudah sampai kita melihat wajah orang yang harus pindah.',
		{
			'Choice': {
				'Dialog': 'maya Keputusan Anda?',
				'OpsiA': {
					'Text': 'Opsi A: Siapkan relokasi cepat yang disorot publik (+Popularitas, -Dana)',
					'Do': 'jump Act2PenggusuranPKLA'
				},
				'OpsiB': {
					'Text': 'Opsi B: Tertibkan lewat prosedur dan pungut tunggakan retribusi (+Integritas, +Dana)',
					'Do': 'jump Act2PenggusuranPKLB'
				}
			}
		}
	],

	'Act2KrisisAirBersih': [
		'show character maya urgent at right',
		'maya Satu kecamatan mati air karena pipa utama bocor. Warga mulai berkumpul di kantor PDAM.',
		'arya Kalau air berhenti, kesabaran publik ikut mengering.',
		{
			'Choice': {
				'Dialog': 'maya Keputusan Anda?',
				'OpsiA': {
					'Text': 'Opsi A: Kirim truk tangki gratis sekarang (+Popularitas, -Dana)',
					'Do': 'jump Act2KrisisAirBersihA'
				},
				'OpsiB': {
					'Text': 'Opsi B: Audit PDAM dan tarik penalti kontrak (+Integritas, +Dana)',
					'Do': 'jump Act2KrisisAirBersihB'
				}
			}
		}
	],

	'Act2JalanBerlubangA': [
		applyStatChanges ({ popularitas: 10, danaAnggaran: -10 }),
		'show notification Act2OptionA',
		'maya Tim lapangan bergerak malam ini. Warga puas, tetapi pos darurat anggaran menipis.',
		'jump Act2CheckStats'
	],

	'Act2PenggusuranPKLA': [
		applyStatChanges ({ popularitas: 10, danaAnggaran: -10 }),
		'show notification Act2OptionA',
		'maya Relokasi cepat meredam kemarahan pedagang. Biayanya tidak kecil, tapi publik melihat Anda hadir.',
		'jump Act2CheckStats'
	],

	'Act2KrisisAirBersihA': [
		applyStatChanges ({ popularitas: 10, danaAnggaran: -10 }),
		'show notification Act2OptionA',
		'maya Truk tangki sampai sebelum malam. Warga lega, kas operasional tertekan.',
		'jump Act2CheckStats'
	],

	'Act2JalanBerlubangB': [
		applyStatChanges ({ integritas: 10, danaAnggaran: 10 }),
		'show notification Act2OptionB',
		'maya Audit awal menemukan klausul denda. Integritas naik, dan dana perbaikan kembali ke kas daerah.',
		'jump Act2CheckStats'
	],

	'Act2PenggusuranPKLB': [
		applyStatChanges ({ integritas: 10, danaAnggaran: 10 }),
		'show notification Act2OptionB',
		'maya Prosedur penertiban bersih dari pungli. Retribusi tertunggak mulai masuk, meski warga bawah belum tentu senang.',
		'jump Act2CheckStats'
	],

	'Act2KrisisAirBersihB': [
		applyStatChanges ({ integritas: 10, danaAnggaran: 10 }),
		'show notification Act2OptionB',
		'maya Penalti kontrak PDAM ditegakkan. Sistem terlihat lebih bersih, dan kas daerah bertambah.',
		'jump Act2CheckStats'
	],

	'Act2CheckStats': [
		{
			'Conditional': {
				'Condition': function () {
					return hasFailedLeadershipStats ();
				},
				'True': 'jump GameOver',
				'False': 'jump Act2NextDay'
			}
		}
	],

	'Act2NextDay': [
		'show character maya neutral at right',
		'maya Evaluasi malam selesai. Selama tidak ada pilar yang jatuh ke angka nol, pemerintahan masih berjalan.',
		{
			'Function': {
				'Apply': function () {
					adjustAct2Progress (1);
					return true;
				},
				'Revert': function () {
					adjustAct2Progress (-1);
					return true;
				}
			}
		},
		{
			'Conditional': {
				'Condition': function () {
					return shouldEnterAct3 ();
				},
				'True': 'jump Act3FinalJudgement',
				'False': 'jump Act2AnotherDay'
			}
		}
	],

	'Act2AnotherDay': [
		'arya Besok, masalah lain akan mengetuk pintu.',
		'jump Act2DailyLoop'
	],

	'Act3FinalJudgement': [
		'show scene election_night_office with fadeIn',
		'show character arya thinking at left with fadeIn',
		'show character maya serious at right with fadeIn',
		'arya Lima tahun. Ribuan jam di kursi ini, ribuan tanda tangan, ribuan kompromi.',
		'arya Semuanya bermuara pada satu malam pemilihan dan satu layar hitung cepat.',
		'maya Hasil akhir sudah masuk 98 persen, Pak. Angka-angkanya sudah tidak akan berubah banyak lagi.',
		'show character arya neutral at left',
		'arya Katakan padaku, Maya. Siapa aku di mata mereka sekarang?',
		'jump Act3EndingDecision'
	],

	'Act3EndingDecision': [
		{
			'Conditional': {
				'Condition': function () {
					return finalEndingBranch ();
				},
				'Ending1': 'jump Ending1',
				'Ending2': 'jump Ending2',
				'Ending3': 'jump Ending3'
			}
		}
	],

	'Ending1': [
		'show scene victory_balcony with fadeIn',
		'show character arya determined at left',
		'show character maya slight_smile at right',
		'maya Ending 1: Legasi Sang Negarawan.',
		'maya Suara dari alun-alun sampai ke balkon, Pak. Anda menang telak, bersih, dan nyaris tanpa celah gugatan.',
		'maya Anda membuktikan bahwa politik bersih bukan sekadar dongeng.',
		'arya Aku memenangkan harapan mereka. Jalan ke depan tetap sulit, tapi setidaknya malam ini aku bisa tidur nyenyak.',
		'end'
	],

	'Ending2': [
		'show scene elite_takeover_room with fadeIn',
		'show character arya concerned at left',
		'show character maya serious at right',
		'maya Ending 2: Sang Boneka Emas.',
		'maya Selamat, Pak. Anda menang tipis. Kampanye besar itu berhasil menutup semua retakan di depan publik.',
		'maya Tapi pesan dari Pak Surya sudah masuk. Mulai besok, kursi ini bukan lagi milik Anda sepenuhnya.',
		'arya Jadi ini bentuk kudeta yang paling sunyi. Tidak ada tank di jalan, hanya kontrak proyek dan janji yang menjerat leherku.',
		'end'
	],

	'Ending3': [
		'show scene bankrupt_city_hall with fadeIn',
		'show character arya concerned at left',
		'show character maya urgent at right',
		'maya Ending 3: Runtuhnya Kekuasaan.',
		'maya Rakyat sudah bicara, Pak. Hitung cepat berhenti di angka yang tidak bisa diselamatkan.',
		'maya Dana daerah kolaps, oposisi menuntut audit total, dan kejaksaan baru saja mengeluarkan surat panggilan terkait skandal.',
		'arya Aku mencoba bermain api dan akhirnya terbakar habis. Lima tahun itu berakhir dengan kota bangkrut, pintu diketuk penyidik, dan namaku runtuh di halaman depan koran.',
		'end'
	],

	'GameOver': [
		'show scene #1b0f0f with fadeIn',
		'show character arya concerned at left',
		'show character maya serious at right',
		'maya Salah satu pilar kepemimpinan menyentuh angka nol, Pak.',
		'maya Tanpa Popularitas, Integritas, atau Dana Anggaran, pemerintahan ini tidak lagi bisa bertahan.',
		'arya Lima tahun itu bahkan tidak sempat selesai.',
		'end'
	]
});
