/**
 * Coordonnées SVG simplifiées des départements français
 * ViewBox : 0 0 1000 1100
 * Métropole + DOM-TOM (Guadeloupe, Martinique, Guyane, Réunion, Mayotte)
 */

export const DEPARTEMENTS_SVG = {
  // ── NORD-PAS-DE-CALAIS ──
  "59": { nom: "Nord", chef_lieu: "Lille", path: "M 540 52 L 570 48 L 598 55 L 605 75 L 590 88 L 558 90 L 535 78 Z", cx: 568, cy: 70 },
  "62": { nom: "Pas-de-Calais", chef_lieu: "Arras", path: "M 500 48 L 540 52 L 535 78 L 510 92 L 488 80 L 482 60 Z", cx: 515, cy: 68 },

  // ── PICARDIE ──
  "02": { nom: "Aisne", chef_lieu: "Laon", path: "M 558 90 L 590 88 L 612 100 L 608 122 L 578 128 L 552 115 Z", cx: 582, cy: 108 },
  "60": { nom: "Oise", chef_lieu: "Beauvais", path: "M 510 92 L 535 78 L 558 90 L 552 115 L 528 120 L 505 108 Z", cx: 530, cy: 103 },
  "80": { nom: "Somme", chef_lieu: "Amiens", path: "M 482 60 L 510 48 L 540 52 L 535 78 L 510 92 L 488 80 Z", cx: 512, cy: 72 },

  // ── NORMANDIE ──
  "76": { nom: "Seine-Maritime", chef_lieu: "Rouen", path: "M 440 68 L 482 60 L 488 80 L 470 98 L 445 95 L 430 80 Z", cx: 460, cy: 82 },
  "27": { nom: "Eure", chef_lieu: "Évreux", path: "M 445 95 L 470 98 L 488 80 L 505 108 L 492 125 L 462 120 L 448 108 Z", cx: 472, cy: 110 },
  "14": { nom: "Calvados", chef_lieu: "Caen", path: "M 395 78 L 440 68 L 445 95 L 425 108 L 400 102 Z", cx: 420, cy: 90 },
  "50": { nom: "Manche", chef_lieu: "Saint-Lô", path: "M 358 68 L 395 78 L 400 102 L 378 115 L 350 105 L 345 82 Z", cx: 372, cy: 90 },
  "61": { nom: "Orne", chef_lieu: "Alençon", path: "M 400 102 L 425 108 L 420 130 L 398 138 L 378 128 L 378 115 Z", cx: 402, cy: 120 },

  // ── BRETAGNE ──
  "35": { nom: "Ille-et-Vilaine", chef_lieu: "Rennes", path: "M 330 118 L 358 108 L 378 115 L 378 128 L 355 140 L 328 135 Z", cx: 353, cy: 126 },
  "22": { nom: "Côtes-d'Armor", chef_lieu: "Saint-Brieuc", path: "M 298 98 L 330 88 L 358 98 L 358 108 L 330 118 L 305 112 Z", cx: 328, cy: 106 },
  "29": { nom: "Finistère", chef_lieu: "Quimper", path: "M 260 95 L 298 88 L 305 112 L 285 125 L 258 118 Z", cx: 280, cy: 108 },
  "56": { nom: "Morbihan", chef_lieu: "Vannes", path: "M 290 118 L 330 118 L 328 135 L 308 148 L 285 140 L 282 125 Z", cx: 308, cy: 132 },

  // ── PAYS DE LA LOIRE ──
  "44": { nom: "Loire-Atlantique", chef_lieu: "Nantes", path: "M 328 135 L 355 140 L 358 158 L 335 168 L 312 160 L 308 148 Z", cx: 335, cy: 153 },
  "85": { nom: "Vendée", chef_lieu: "La Roche-sur-Yon", path: "M 308 148 L 335 168 L 330 188 L 308 195 L 290 182 L 292 162 Z", cx: 312, cy: 172 },
  "49": { nom: "Maine-et-Loire", chef_lieu: "Angers", path: "M 355 140 L 385 138 L 392 158 L 368 172 L 345 168 L 358 158 Z", cx: 368, cy: 156 },
  "53": { nom: "Mayenne", chef_lieu: "Laval", path: "M 358 108 L 385 112 L 388 132 L 368 140 L 355 140 L 355 128 Z", cx: 370, cy: 126 },
  "72": { nom: "Sarthe", chef_lieu: "Le Mans", path: "M 385 112 L 415 110 L 420 130 L 398 138 L 385 138 L 388 132 Z", cx: 402, cy: 126 },

  // ── CENTRE-VAL DE LOIRE ──
  "28": { nom: "Eure-et-Loir", chef_lieu: "Chartres", path: "M 448 108 L 478 108 L 482 128 L 460 138 L 438 132 L 438 118 Z", cx: 460, cy: 122 },
  "45": { nom: "Loiret", chef_lieu: "Orléans", path: "M 478 108 L 508 110 L 512 132 L 490 145 L 468 142 L 460 138 L 482 128 Z", cx: 488, cy: 128 },
  "41": { nom: "Loir-et-Cher", chef_lieu: "Blois", path: "M 438 132 L 460 138 L 468 142 L 462 162 L 440 168 L 418 158 L 420 140 Z", cx: 443, cy: 150 },
  "37": { nom: "Indre-et-Loire", chef_lieu: "Tours", path: "M 392 158 L 420 158 L 425 178 L 402 185 L 380 175 L 380 162 Z", cx: 402, cy: 170 },
  "36": { nom: "Indre", chef_lieu: "Châteauroux", path: "M 420 158 L 448 158 L 452 178 L 432 190 L 408 185 L 402 185 L 425 178 Z", cx: 430, cy: 175 },
  "18": { nom: "Cher", chef_lieu: "Bourges", path: "M 462 145 L 492 148 L 498 168 L 475 180 L 452 178 L 448 158 L 468 158 Z", cx: 475, cy: 163 },
  "23": { nom: "Creuse", chef_lieu: "Guéret", path: "M 440 185 L 468 182 L 475 200 L 455 212 L 432 205 L 430 192 Z", cx: 453, cy: 198 },

  // ── ÎLE-DE-FRANCE ──
  "75": { nom: "Paris", chef_lieu: "Paris", path: "M 498 118 L 510 118 L 510 128 L 498 128 Z", cx: 504, cy: 123 },
  "77": { nom: "Seine-et-Marne", chef_lieu: "Melun", path: "M 510 110 L 540 112 L 545 135 L 520 145 L 498 140 L 498 118 L 510 118 Z", cx: 522, cy: 128 },
  "78": { nom: "Yvelines", chef_lieu: "Versailles", path: "M 470 108 L 498 108 L 498 128 L 480 135 L 462 128 L 462 115 Z", cx: 480, cy: 120 },
  "91": { nom: "Essonne", chef_lieu: "Évry", path: "M 480 128 L 498 128 L 498 145 L 482 150 L 468 142 L 470 132 Z", cx: 483, cy: 138 },
  "92": { nom: "Hauts-de-Seine", chef_lieu: "Nanterre", path: "M 488 112 L 500 112 L 500 122 L 488 122 Z", cx: 494, cy: 117 },
  "93": { nom: "Seine-Saint-Denis", chef_lieu: "Bobigny", path: "M 500 108 L 515 108 L 515 120 L 502 120 Z", cx: 508, cy: 114 },
  "94": { nom: "Val-de-Marne", chef_lieu: "Créteil", path: "M 498 120 L 512 120 L 512 132 L 498 132 Z", cx: 505, cy: 126 },
  "95": { nom: "Val-d'Oise", chef_lieu: "Cergy", path: "M 470 98 L 500 98 L 502 112 L 478 112 L 468 108 Z", cx: 485, cy: 106 },

  // ── GRAND EST ──
  "08": { nom: "Ardennes", chef_lieu: "Charleville-Mézières", path: "M 590 88 L 622 82 L 632 102 L 612 115 L 590 108 Z", cx: 610, cy: 98 },
  "51": { nom: "Marne", chef_lieu: "Châlons-en-Champagne", path: "M 552 115 L 578 128 L 582 150 L 558 158 L 532 148 L 528 128 Z", cx: 557, cy: 136 },
  "10": { nom: "Aube", chef_lieu: "Troyes", path: "M 512 132 L 540 130 L 545 150 L 522 158 L 505 150 L 508 138 Z", cx: 525, cy: 145 },
  "52": { nom: "Haute-Marne", chef_lieu: "Chaumont", path: "M 558 148 L 585 148 L 590 168 L 568 178 L 548 168 L 545 155 Z", cx: 567, cy: 163 },
  "55": { nom: "Meuse", chef_lieu: "Bar-le-Duc", path: "M 590 108 L 618 108 L 622 130 L 600 138 L 578 130 L 578 118 Z", cx: 600, cy: 122 },
  "54": { nom: "Meurthe-et-Moselle", chef_lieu: "Nancy", path: "M 612 100 L 640 98 L 648 118 L 628 128 L 608 122 L 608 112 Z", cx: 628, cy: 113 },
  "57": { nom: "Moselle", chef_lieu: "Metz", path: "M 630 78 L 660 75 L 668 98 L 645 108 L 622 100 L 620 88 Z", cx: 645, cy: 92 },
  "67": { nom: "Bas-Rhin", chef_lieu: "Strasbourg", path: "M 655 98 L 682 95 L 688 120 L 668 128 L 648 120 L 648 105 Z", cx: 668, cy: 112 },
  "68": { nom: "Haut-Rhin", chef_lieu: "Colmar", path: "M 655 122 L 682 120 L 685 145 L 665 152 L 645 145 L 648 128 Z", cx: 665, cy: 136 },
  "88": { nom: "Vosges", chef_lieu: "Épinal", path: "M 620 128 L 648 125 L 652 148 L 630 158 L 608 150 L 608 135 Z", cx: 630, cy: 142 },
  "67b": { nom: "Alsace (zone)", chef_lieu: "", path: "", cx: 0, cy: 0 },

  // ── BOURGOGNE-FRANCHE-COMTÉ ──
  "89": { nom: "Yonne", chef_lieu: "Auxerre", path: "M 510 148 L 538 145 L 542 168 L 520 178 L 500 170 L 498 155 Z", cx: 520, cy: 162 },
  "21": { nom: "Côte-d'Or", chef_lieu: "Dijon", path: "M 542 155 L 572 152 L 578 175 L 555 185 L 532 178 L 530 162 Z", cx: 555, cy: 168 },
  "71": { nom: "Saône-et-Loire", chef_lieu: "Mâcon", path: "M 540 178 L 568 175 L 572 200 L 550 212 L 525 205 L 522 188 Z", cx: 548, cy: 195 },
  "58": { nom: "Nièvre", chef_lieu: "Nevers", path: "M 498 168 L 528 165 L 532 188 L 510 198 L 488 190 L 488 175 Z", cx: 510, cy: 182 },
  "70": { nom: "Haute-Saône", chef_lieu: "Vesoul", path: "M 600 148 L 628 145 L 632 168 L 610 178 L 588 170 L 588 155 Z", cx: 610, cy: 162 },
  "25": { nom: "Doubs", chef_lieu: "Besançon", path: "M 628 148 L 658 145 L 662 168 L 640 178 L 618 170 L 618 155 Z", cx: 640, cy: 162 },
  "39": { nom: "Jura", chef_lieu: "Lons-le-Saunier", path: "M 598 170 L 625 168 L 628 192 L 608 202 L 585 195 L 585 178 Z", cx: 607, cy: 185 },
  "90": { nom: "Territoire de Belfort", chef_lieu: "Belfort", path: "M 652 155 L 668 152 L 670 165 L 655 168 L 648 162 Z", cx: 660, cy: 160 },

  // ── AUVERGNE-RHÔNE-ALPES ──
  "03": { nom: "Allier", chef_lieu: "Moulins", path: "M 488 190 L 515 188 L 520 210 L 498 220 L 478 212 L 478 198 Z", cx: 500, cy: 205 },
  "63": { nom: "Puy-de-Dôme", chef_lieu: "Clermont-Ferrand", path: "M 460 208 L 488 205 L 492 228 L 470 240 L 448 232 L 448 218 Z", cx: 470, cy: 223 },
  "15": { nom: "Cantal", chef_lieu: "Aurillac", path: "M 450 232 L 478 228 L 482 252 L 460 262 L 438 255 L 438 240 Z", cx: 460, cy: 247 },
  "43": { nom: "Haute-Loire", chef_lieu: "Le Puy-en-Velay", path: "M 485 228 L 512 225 L 518 248 L 495 258 L 475 250 L 475 238 Z", cx: 497, cy: 242 },
  "42": { nom: "Loire", chef_lieu: "Saint-Étienne", path: "M 520 205 L 548 202 L 552 225 L 530 235 L 508 228 L 508 215 Z", cx: 530, cy: 218 },
  "69": { nom: "Rhône", chef_lieu: "Lyon", path: "M 548 195 L 575 192 L 578 215 L 558 225 L 535 218 L 535 205 Z", cx: 557, cy: 208 },
  "01": { nom: "Ain", chef_lieu: "Bourg-en-Bresse", path: "M 572 175 L 600 172 L 605 195 L 582 205 L 558 198 L 558 182 Z", cx: 580, cy: 190 },
  "74": { nom: "Haute-Savoie", chef_lieu: "Annecy", path: "M 625 185 L 655 182 L 660 205 L 638 215 L 615 208 L 615 195 Z", cx: 638, cy: 199 },
  "73": { nom: "Savoie", chef_lieu: "Chambéry", path: "M 605 205 L 635 202 L 640 225 L 618 235 L 595 228 L 595 215 Z", cx: 618, cy: 218 },
  "38": { nom: "Isère", chef_lieu: "Grenoble", path: "M 578 215 L 608 212 L 612 238 L 590 248 L 568 240 L 568 225 Z", cx: 590, cy: 230 },
  "26": { nom: "Drôme", chef_lieu: "Valence", path: "M 558 238 L 588 235 L 592 258 L 570 268 L 548 260 L 548 248 Z", cx: 570, cy: 252 },
  "07": { nom: "Ardèche", chef_lieu: "Privas", path: "M 530 238 L 558 235 L 562 258 L 540 268 L 518 260 L 518 248 Z", cx: 540, cy: 252 },

  // ── PROVENCE-ALPES-CÔTE D'AZUR ──
  "04": { nom: "Alpes-de-Haute-Provence", chef_lieu: "Digne-les-Bains", path: "M 592 258 L 622 255 L 628 278 L 605 288 L 582 280 L 580 265 Z", cx: 605, cy: 272 },
  "05": { nom: "Hautes-Alpes", chef_lieu: "Gap", path: "M 618 235 L 648 232 L 652 255 L 630 265 L 608 258 L 608 245 Z", cx: 630, cy: 248 },
  "06": { nom: "Alpes-Maritimes", chef_lieu: "Nice", path: "M 635 258 L 665 255 L 668 278 L 648 285 L 628 278 L 628 265 Z", cx: 648, cy: 270 },
  "13": { nom: "Bouches-du-Rhône", chef_lieu: "Marseille", path: "M 568 278 L 600 275 L 605 298 L 582 308 L 558 300 L 558 288 Z", cx: 582, cy: 292 },
  "83": { nom: "Var", chef_lieu: "Toulon", path: "M 598 278 L 630 275 L 635 298 L 612 308 L 588 300 L 588 288 Z", cx: 612, cy: 292 },
  "84": { nom: "Vaucluse", chef_lieu: "Avignon", path: "M 558 258 L 588 255 L 592 278 L 570 288 L 548 280 L 548 268 Z", cx: 570, cy: 272 },

  // ── OCCITANIE ──
  "30": { nom: "Gard", chef_lieu: "Nîmes", path: "M 528 262 L 558 258 L 562 280 L 540 290 L 518 282 L 518 270 Z", cx: 540, cy: 275 },
  "34": { nom: "Hérault", chef_lieu: "Montpellier", path: "M 498 272 L 528 268 L 532 290 L 510 302 L 488 295 L 488 282 Z", cx: 510, cy: 286 },
  "48": { nom: "Lozère", chef_lieu: "Mende", path: "M 502 248 L 530 245 L 535 268 L 512 278 L 490 270 L 490 258 Z", cx: 512, cy: 262 },
  "12": { nom: "Aveyron", chef_lieu: "Rodez", path: "M 468 252 L 498 248 L 502 272 L 480 282 L 458 275 L 458 262 Z", cx: 480, cy: 266 },
  "46": { nom: "Lot", chef_lieu: "Cahors", path: "M 435 258 L 465 255 L 468 278 L 445 288 L 422 280 L 422 268 Z", cx: 445, cy: 272 },
  "82": { nom: "Tarn-et-Garonne", chef_lieu: "Montauban", path: "M 410 275 L 438 272 L 442 295 L 420 305 L 398 298 L 398 285 Z", cx: 420, cy: 289 },
  "81": { nom: "Tarn", chef_lieu: "Albi", path: "M 438 268 L 468 265 L 472 288 L 450 298 L 428 290 L 428 278 Z", cx: 450, cy: 282 },
  "31": { nom: "Haute-Garonne", chef_lieu: "Toulouse", path: "M 398 288 L 428 285 L 432 308 L 408 318 L 385 310 L 385 298 Z", cx: 408, cy: 302 },
  "09": { nom: "Ariège", chef_lieu: "Foix", path: "M 410 310 L 438 308 L 440 330 L 418 338 L 398 330 L 398 318 Z", cx: 419, cy: 323 },
  "11": { nom: "Aude", chef_lieu: "Carcassonne", path: "M 458 290 L 488 288 L 492 310 L 470 320 L 448 312 L 448 300 Z", cx: 470, cy: 305 },
  "66": { nom: "Pyrénées-Orientales", chef_lieu: "Perpignan", path: "M 448 315 L 478 312 L 480 335 L 458 342 L 438 335 L 438 322 Z", cx: 458, cy: 328 },
  "32": { nom: "Gers", chef_lieu: "Auch", path: "M 375 295 L 405 292 L 408 315 L 385 325 L 362 318 L 362 305 Z", cx: 385, cy: 309 },
  "65": { nom: "Hautes-Pyrénées", chef_lieu: "Tarbes", path: "M 362 308 L 392 305 L 395 328 L 372 338 L 350 330 L 350 318 Z", cx: 372, cy: 322 },

  // ── NOUVELLE-AQUITAINE ──
  "33": { nom: "Gironde", chef_lieu: "Bordeaux", path: "M 335 258 L 368 255 L 372 280 L 350 292 L 325 285 L 322 270 Z", cx: 348, cy: 274 },
  "24": { nom: "Dordogne", chef_lieu: "Périgueux", path: "M 368 248 L 398 245 L 402 268 L 380 278 L 358 272 L 358 258 Z", cx: 380, cy: 262 },
  "47": { nom: "Lot-et-Garonne", chef_lieu: "Agen", path: "M 368 278 L 398 275 L 402 298 L 380 308 L 358 300 L 358 288 Z", cx: 380, cy: 292 },
  "40": { nom: "Landes", chef_lieu: "Mont-de-Marsan", path: "M 325 288 L 358 285 L 362 310 L 338 322 L 312 315 L 310 300 Z", cx: 335, cy: 305 },
  "64": { nom: "Pyrénées-Atlantiques", chef_lieu: "Pau", path: "M 312 312 L 345 308 L 348 332 L 325 342 L 302 335 L 300 322 Z", cx: 325, cy: 326 },
  "79": { nom: "Deux-Sèvres", chef_lieu: "Niort", path: "M 355 172 L 385 168 L 388 190 L 365 200 L 342 192 L 342 180 Z", cx: 365, cy: 186 },
  "86": { nom: "Vienne", chef_lieu: "Poitiers", path: "M 385 185 L 415 182 L 418 205 L 395 215 L 372 208 L 372 195 Z", cx: 395, cy: 200 },
  "17": { nom: "Charente-Maritime", chef_lieu: "La Rochelle", path: "M 315 192 L 348 188 L 352 212 L 328 222 L 305 215 L 302 202 Z", cx: 328, cy: 207 },
  "16": { nom: "Charente", chef_lieu: "Angoulême", path: "M 348 205 L 378 202 L 382 225 L 358 235 L 335 228 L 335 215 Z", cx: 358, cy: 219 },
  "87": { nom: "Haute-Vienne", chef_lieu: "Limoges", path: "M 390 208 L 420 205 L 425 228 L 402 238 L 378 230 L 378 218 Z", cx: 402, cy: 222 },
  "19": { nom: "Corrèze", chef_lieu: "Tulle", path: "M 415 228 L 445 225 L 448 248 L 425 258 L 402 250 L 402 238 Z", cx: 425, cy: 242 },

  // ── OCCITANIE OUEST ──

  // ── CORSE ──
  "2A": { nom: "Corse-du-Sud", chef_lieu: "Ajaccio", path: "M 680 290 L 700 285 L 708 310 L 695 325 L 675 318 L 672 302 Z", cx: 690, cy: 307 },
  "2B": { nom: "Haute-Corse", chef_lieu: "Bastia", path: "M 688 265 L 710 260 L 718 285 L 700 295 L 678 288 L 678 275 Z", cx: 698, cy: 278 },
}

// ─────────────────────────────────────────────────────────────
// DOM-TOM (en encarts positionnés sur la carte)
// ─────────────────────────────────────────────────────────────

export const DOMTOM_SVG = {
  "971": {
    nom: "Guadeloupe",
    chef_lieu: "Basse-Terre",
    encart: { x: 50, y: 820, w: 80, h: 60 },
    path: "M 60 830 L 90 825 L 100 845 L 85 865 L 62 858 Z",
    cx: 80, cy: 845,
  },
  "972": {
    nom: "Martinique",
    chef_lieu: "Fort-de-France",
    encart: { x: 150, y: 820, w: 70, h: 60 },
    path: "M 162 832 L 188 828 L 195 848 L 180 865 L 158 858 Z",
    cx: 178, cy: 847,
  },
  "973": {
    nom: "Guyane",
    chef_lieu: "Cayenne",
    encart: { x: 250, y: 810, w: 90, h: 75 },
    path: "M 260 820 L 300 815 L 308 845 L 290 875 L 262 868 Z",
    cx: 285, cy: 847,
  },
  "974": {
    nom: "La Réunion",
    chef_lieu: "Saint-Denis",
    encart: { x: 360, y: 820, w: 75, h: 60 },
    path: "M 372 832 L 400 828 L 408 848 L 392 865 L 368 858 Z",
    cx: 388, cy: 847,
  },
  "976": {
    nom: "Mayotte",
    chef_lieu: "Mamoudzou",
    encart: { x: 455, y: 820, w: 65, h: 55 },
    path: "M 465 832 L 488 828 L 495 848 L 480 862 L 460 855 Z",
    cx: 478, cy: 845,
  },
}

// ─────────────────────────────────────────────────────────────
// DONNÉES POLITIQUES PAR DÉPARTEMENT
// ─────────────────────────────────────────────────────────────

export const POLITIQUE_DEPARTEMENTS = {
  // Format : { parti_dominant, score_pct, second_parti, intentions_2026 }
  "59": { parti: "RN",     score: 38, second: "PS_ECO",  intentions: { RN: 38, PS_ECO: 22, EPR: 18, LFI: 12 } },
  "62": { parti: "RN",     score: 42, second: "LR",      intentions: { RN: 42, LR: 20, EPR: 18, PS_ECO: 12 } },
  "75": { parti: "PS_ECO", score: 35, second: "EPR",     intentions: { PS_ECO: 35, EPR: 22, LFI: 20, RN: 8  } },
  "13": { parti: "RN",     score: 36, second: "PS_ECO",  intentions: { RN: 36, PS_ECO: 24, EPR: 18, LFI: 14 } },
  "69": { parti: "EPR",    score: 30, second: "PS_ECO",  intentions: { EPR: 30, PS_ECO: 28, LFI: 18, RN: 15 } },
  "33": { parti: "PS_ECO", score: 32, second: "EPR",     intentions: { PS_ECO: 32, EPR: 28, RN: 22, LFI: 12 } },
  "31": { parti: "PS_ECO", score: 34, second: "EPR",     intentions: { PS_ECO: 34, EPR: 25, LFI: 18, RN: 15 } },
  "67": { parti: "EPR",    score: 28, second: "RN",      intentions: { EPR: 28, RN: 25, PS_ECO: 22, LR: 15 } },
  "35": { parti: "PS_ECO", score: 30, second: "EPR",     intentions: { PS_ECO: 30, EPR: 28, RN: 20, LFI: 15 } },
  "29": { parti: "PS_ECO", score: 32, second: "LFI",     intentions: { PS_ECO: 32, LFI: 22, EPR: 20, RN: 18 } },
  "44": { parti: "PS_ECO", score: 30, second: "EPR",     intentions: { PS_ECO: 30, EPR: 25, LFI: 20, RN: 18 } },
  "06": { parti: "RN",     score: 40, second: "LR",      intentions: { RN: 40, LR: 22, EPR: 20, PS_ECO: 10 } },
  "83": { parti: "RN",     score: 42, second: "EPR",     intentions: { RN: 42, EPR: 22, LR: 18, PS_ECO: 12 } },
  "84": { parti: "RN",     score: 35, second: "EPR",     intentions: { RN: 35, EPR: 25, LR: 20, PS_ECO: 15 } },
  "34": { parti: "PS_ECO", score: 28, second: "LFI",     intentions: { PS_ECO: 28, LFI: 22, RN: 25, EPR: 18 } },
  "2A": { parti: "EPR",    score: 32, second: "LR",      intentions: { EPR: 32, LR: 28, RN: 22, PS_ECO: 12 } },
  "2B": { parti: "EPR",    score: 30, second: "LR",      intentions: { EPR: 30, LR: 25, RN: 22, PS_ECO: 15 } },
  "971":{ parti: "PS_ECO", score: 35, second: "LFI",     intentions: { PS_ECO: 35, LFI: 28, RN: 15, EPR: 15 } },
  "972":{ parti: "PS_ECO", score: 38, second: "LFI",     intentions: { PS_ECO: 38, LFI: 30, RN: 12, EPR: 12 } },
  "973":{ parti: "LFI",    score: 42, second: "PS_ECO",  intentions: { LFI: 42, PS_ECO: 30, RN: 10, EPR: 12 } },
  "974":{ parti: "PS_ECO", score: 32, second: "LFI",     intentions: { PS_ECO: 32, LFI: 28, RN: 18, EPR: 15 } },
  "976":{ parti: "PS_ECO", score: 40, second: "LFI",     intentions: { PS_ECO: 40, LFI: 32, RN: 12, EPR: 10 } },
}

// Couleurs des partis
export const COULEURS_PARTIS = {
  LFI:        "#cc0000",
  PS_ECO:     "#ff8c00",
  EPR:        "#ffcc00",
  LR:         "#0066cc",
  RN:         "#1a1aff",
  PATRIOTES:  "#003399",
  UPR:        "#1a3a6b",
  TRAVAILLEURS:"#8b0000",
  ANIMALISTE: "#22c55e",
  DIVERS:     "#94a3b8",
}

// Données par défaut pour les départements sans données spécifiques
export function getPolitiqueDepartement(code) {
  return POLITIQUE_DEPARTEMENTS[code] ?? {
    parti: "EPR",
    score: 25,
    second: "RN",
    intentions: { EPR: 25, RN: 25, PS_ECO: 22, LFI: 15, LR: 13 },
  }
}
