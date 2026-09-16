/* ---------------------------------------------------------------
   HUDA'S JEWELRY — catalogul pieselor
   ---------------------------------------------------------------
   FIȘIER GENERAT. Este rescris de fiecare dată când se salvează din
   panoul de la /admin, deci orice modificare făcută de mână aici se
   pierde la următoarea salvare. Pentru schimbări de conținut,
   folosește panoul.

   Câmpuri care NU se editează din panou, dar sunt duse mai departe:
     spin        câte cadre are rotirea (de obicei 36). Cadrele stau în
                 assets/spins/<id>/01.jpg … Vezi FOTOGRAFIERE.md.
     spinReverse true dacă rotirea merge în sensul greşit.
   --------------------------------------------------------------- */

const PRODUCTS = [
  {
    "id": "inel-sculptural",
    "photos": 3,
    "kind": "inel",
    "sold": false,
    "exhibited": "sijw",
    "ro": {
      "name": "Inel sculptural",
      "tagline": "Argint turnat, patru pietre",
      "description": "Piesa cea mai amplă din colecție: o formă de argint care pare curgută, nu tăiată, purtând o piatră lila cu vinișoare, una violet fațetată, una albă lăptoasă și un colț de piatră caldă, chihlimbarie. Fiecare piatră stă în alt tip de montură.",
      "materials": "Argint, piatră lila cu vinișoare, piatră violet fațetată, piatră albă, piatră caldă translucidă"
    },
    "en": {
      "name": "Sculptural ring",
      "tagline": "Cast silver, four stones",
      "description": "The largest piece in the collection: a silver form that looks poured rather than cut, carrying a veined lilac stone, a faceted violet one, a milky white one and a shard of warm amber-toned stone. Every stone sits in a different kind of setting.",
      "materials": "Silver, veined lilac stone, faceted violet stone, white stone, warm translucent stone"
    }
  },
  {
    "id": "colier-auriu-luna",
    "photos": 1,
    "kind": "colier",
    "sold": false,
    "exhibited": "rjw26",
    "ro": {
      "name": "Colier semilună",
      "tagline": "Auriu, dantelă de sârmă, perle roz",
      "description": "O semilună lată, umplută cu bucle de sârmă care nu se repetă niciodată identic, și patru perle roz prinse pe marginea de sus. Se poartă la baza gâtului.",
      "materials": "Metal auriu, perle roz"
    },
    "en": {
      "name": "Crescent necklace",
      "tagline": "Gold tone, wire lace, pink pearls",
      "description": "A wide crescent filled with looping wire that never repeats the same way twice, with four pink pearls caught along the upper edge. It sits at the base of the throat.",
      "materials": "Gold-tone metal, pink pearls"
    }
  },
  {
    "id": "pandantiv-perle",
    "photos": 1,
    "kind": "pandantiv",
    "sold": false,
    "exhibited": "rjw26",
    "ro": {
      "name": "Pandantiv dantelă",
      "tagline": "Argint răsucit, șapte perle",
      "description": "Sârmă de argint răsucită, împletită într-o dantelă care pare desenată dintr-o singură linie. Șapte perle albe stau prinse în ochiurile ei, la întâmplare.",
      "materials": "Argint răsucit, perle albe, lanț de argint"
    },
    "en": {
      "name": "Lace pendant",
      "tagline": "Twisted silver, seven pearls",
      "description": "Twisted silver wire worked into a lace that looks drawn in a single unbroken line. Seven white pearls sit caught in its loops, scattered rather than placed.",
      "materials": "Twisted silver, white pearls, silver chain"
    }
  },
  {
    "id": "cercei-luna",
    "photos": 1,
    "kind": "cercei",
    "sold": false,
    "exhibited": "rjw26",
    "ro": {
      "name": "Cercei lună",
      "tagline": "Lună plină și semilună",
      "description": "O pereche care nu e o pereche: un cerc întreg și o semilună, amândouă din aceeași dantelă de sârmă. Perle albe și roz, pietre mici și întunecate pe contur.",
      "materials": "Argint, perle albe și roz, pietre închise la culoare"
    },
    "en": {
      "name": "Moon earrings",
      "tagline": "A full moon and a crescent",
      "description": "A pair that is not quite a pair: one full circle, one crescent, both in the same wire lace. White and pink pearls, with small dark stones set around the rim.",
      "materials": "Silver, white and pink pearls, dark stones"
    }
  },
  {
    "id": "inel-banda-perle",
    "photos": 1,
    "kind": "inel",
    "sold": false,
    "exhibited": "rjw26",
    "ro": {
      "name": "Inel cupolă",
      "tagline": "Bandă largă, perle pe margine",
      "description": "O bandă lată de dantelă de argint, purtată ca o cupolă deasupra degetului, cu trei perle albe strânse într-o parte și pietre mici, întunecate, pe contur.",
      "materials": "Argint, perle albe, pietre închise la culoare"
    },
    "en": {
      "name": "Dome ring",
      "tagline": "A wide band, pearls along the rim",
      "description": "A wide band of silver lace worn like a dome above the finger, with three white pearls gathered to one side and small dark stones set around the edge.",
      "materials": "Silver, white pearls, dark stones"
    }
  },
  {
    "id": "inel-peridot-perle",
    "photos": 1,
    "kind": "inel",
    "sold": false,
    "exhibited": "rjw26",
    "ro": {
      "name": "Inel cu piatră verde",
      "tagline": "Patru perle în jurul unei pietre verzi",
      "description": "O piatră verde fațetată, prinsă în mijlocul unui cadru de sârmă răsucită, cu patru perle albe așezate în cele patru colțuri. Cel mai simetric inel din colecție.",
      "materials": "Argint răsucit, piatră verde fațetată, perle albe"
    },
    "en": {
      "name": "Green stone ring",
      "tagline": "Four pearls around a green stone",
      "description": "A faceted green stone held at the centre of a twisted wire frame, with four white pearls set at the four corners. The most symmetrical ring in the collection.",
      "materials": "Twisted silver, faceted green stone, white pearls"
    }
  },
  {
    "id": "inel-cub",
    "photos": 1,
    "kind": "inel",
    "sold": false,
    "exhibited": "handwerk",
    "ro": {
      "name": "Inel cub",
      "tagline": "O cutie deschisă, o piatră roșiatică",
      "description": "Un cub construit din bucle de argint, lăsat gol înăuntru, cu o piatră rotundă roșiatică prinsă într-o față. Se vede prin el dintr-o parte în alta.",
      "materials": "Argint, piatră roșiatică cabochon"
    },
    "en": {
      "name": "Cube ring",
      "tagline": "An open box, a red-brown stone",
      "description": "A cube built from loops of silver and left hollow inside, with a round red-brown stone set into one face. You can see straight through it from side to side.",
      "materials": "Silver, red-brown cabochon stone"
    }
  },
  {
    "id": "inel-auriu-smarald",
    "photos": 1,
    "kind": "inel",
    "sold": false,
    "exhibited": "handwerk",
    "ro": {
      "name": "Inel auriu",
      "tagline": "Oval de sârmă, piatră verde",
      "description": "Un oval lat de bucle aurii, ridicat deasupra degetului, cu o piatră verde dreptunghiulară așezată descentrat. Banda continuă același desen de sârmă.",
      "materials": "Metal auriu, piatră verde fațetată"
    },
    "en": {
      "name": "Gold ring",
      "tagline": "A wire oval, a green stone",
      "description": "A wide oval of golden loops raised above the finger, with a rectangular green stone set off-centre. The band carries on in the same wire drawing.",
      "materials": "Gold-tone metal, faceted green stone"
    }
  },
  {
    "id": "inel-piatra-clara",
    "photos": 1,
    "kind": "inel",
    "sold": false,
    "exhibited": null,
    "ro": {
      "name": "Inel cu piatră transparentă",
      "tagline": "Bandă răsucită, piatră limpede",
      "description": "Cel mai discret inel din colecție. O piatră mare, limpede și fațetată, ținută în gheare deasupra unei benzi din sârmă răsucită, ca o funie subțire.",
      "materials": "Argint răsucit, piatră transparentă fațetată"
    },
    "en": {
      "name": "Clear stone ring",
      "tagline": "A twisted band, a clear stone",
      "description": "The quietest ring in the collection. One large clear faceted stone held in claws above a band of twisted wire, like a fine rope.",
      "materials": "Twisted silver, clear faceted stone"
    }
  },
  {
    "id": "bratara-frunze",
    "photos": 1,
    "kind": "bratara",
    "sold": false,
    "exhibited": null,
    "ro": {
      "name": "Brățară cu frunze",
      "tagline": "Frunze de argint, piatră violet",
      "description": "Frunze de argint cu nervurile marcate, strânse în jurul unei pietre violet pestrițe, cu spirale subțiri peste ea. A doua piatră, gri, stă mai sus, pe ramură.",
      "materials": "Argint, piatră violet pestriță, piatră gri"
    },
    "en": {
      "name": "Leaf cuff",
      "tagline": "Silver leaves, a violet stone",
      "description": "Silver leaves with their veins drawn in, gathered around a mottled violet stone with fine spirals laid over it. A second grey stone sits higher up the branch.",
      "materials": "Silver, mottled violet stone, grey stone"
    }
  },
  {
    "id": "bratara-inel",
    "photos": 1,
    "kind": "bratara",
    "sold": false,
    "exhibited": "handwerk",
    "ro": {
      "name": "Brățară-inel",
      "tagline": "De la încheietură până la deget",
      "description": "Două lanțuri — unul pentru încheietură, unul pentru deget — legate printr-un ochi de dantelă de argint, cu o piatră verde pestriță în mijlocul palmei.",
      "materials": "Argint, piatră verde pestriță"
    },
    "en": {
      "name": "Hand chain",
      "tagline": "From the wrist to the finger",
      "description": "Two chains — one for the wrist, one for the finger — joined by a panel of silver lace, with a mottled green stone sitting at the centre of the back of the hand.",
      "materials": "Silver, mottled green stone"
    }
  },
  {
    "id": "colier-trei-pietre",
    "photos": 1,
    "kind": "colier",
    "sold": false,
    "exhibited": "handwerk",
    "ro": {
      "name": "Colier cu trei pietre",
      "tagline": "Cărămiziu, albastru, galben",
      "description": "Trei pietre ovale — una cărămizie, una albastră-cenușie, una galbenă — fiecare așezată în câte un cuib de sârmă, prinse pe un lanț cu zale lungi. Colier lung.",
      "materials": "Argint, trei pietre ovale (cărămizie, albastră-cenușie, galbenă)"
    },
    "en": {
      "name": "Three-stone necklace",
      "tagline": "Brick red, blue, yellow",
      "description": "Three oval stones — one brick red, one blue-grey, one yellow — each set into its own nest of wire and strung along a long-linked chain. Worn long.",
      "materials": "Silver, three oval stones (brick red, blue-grey, yellow)"
    }
  },
  {
    "id": "pandantiv-zoisit",
    "photos": 1,
    "kind": "pandantiv",
    "sold": false,
    "exhibited": "handwerk",
    "ro": {
      "name": "Pandantiv cu piatră verde",
      "tagline": "Spirale de argint în jurul unei pietre",
      "description": "O piatră verde cu incluziuni roz și negre, aşezată în mijlocul unei rozete de spirale de argint. Piatra e singura care aduce culoare; restul e desen.",
      "materials": "Argint, piatră verde cu incluziuni roz, lanț de argint"
    },
    "en": {
      "name": "Green stone pendant",
      "tagline": "Silver spirals around a stone",
      "description": "A green stone shot through with pink and black, set at the centre of a rosette of silver spirals. The stone carries all the colour; the rest is drawing.",
      "materials": "Silver, green stone with pink inclusions, silver chain"
    }
  }
];

const EXHIBITIONS = {
  "rjw26": {
    "ro": "Romanian Jewelry Week 2026",
    "en": "Romanian Jewelry Week 2026"
  },
  "sijw": {
    "ro": "Slovenian Jewelry Week",
    "en": "Slovenian Jewelry Week"
  },
  "handwerk": {
    "ro": "Handwerk & Design, München",
    "en": "Handwerk & Design, Munich"
  }
};
