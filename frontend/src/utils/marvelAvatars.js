const marvelBoys = [
  {"url":"https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/620-spider-man.jpg","name":"Spider-Man"},
  {"url":"https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/332-hulk.jpg","name":"Hulk"},
  {"url":"https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/70-batman.jpg","name":"Batman (DC)"},
  {"url":"https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/644-superman.jpg","name":"Superman (DC)"},
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/1-a-bomb.jpg",
    "name": "A-Bomb"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/4-abomination.jpg",
    "name": "Abomination"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/5-abraxas.jpg",
    "name": "Abraxas"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/6-absorbing-man.jpg",
    "name": "Absorbing Man"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/10-agent-bob.jpg",
    "name": "Agent Bob"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/11-agent-zero.jpg",
    "name": "Agent Zero"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/12-air-walker.jpg",
    "name": "Air-Walker"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/13-ajax.jpg",
    "name": "Ajax"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/29-annihilus.jpg",
    "name": "Annihilus"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/31-ant-man-ii.jpg",
    "name": "Ant-Man II"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/35-apocalypse.jpg",
    "name": "Apocalypse"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/43-ares.jpg",
    "name": "Ares"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/57-azazel.jpg",
    "name": "Azazel"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/61-banshee.jpg",
    "name": "Banshee"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/62-bantam.jpg",
    "name": "Bantam"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/72-battlestar.jpg",
    "name": "Battlestar"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/75-beast.jpg",
    "name": "Beast"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/79-beta-ray-bill.jpg",
    "name": "Beta Ray Bill"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/80-beyonder.jpg",
    "name": "Beyonder"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/83-big-man.jpg",
    "name": "Big Man"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/92-bishop.jpg",
    "name": "Bishop"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/96-black-bolt.jpg",
    "name": "Black Bolt"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/102-black-knight-iii.jpg",
    "name": "Black Knight III"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/106-black-panther.jpg",
    "name": "Black Panther"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/109-blackout.jpg",
    "name": "Blackout"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/110-blackwing.jpg",
    "name": "Blackwing"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/111-blackwulf.jpg",
    "name": "Blackwulf"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/112-blade.jpg",
    "name": "Blade"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/118-blizzard-ii.jpg",
    "name": "Blizzard II"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/119-blob.jpg",
    "name": "Blob"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/121-bloodhawk.jpg",
    "name": "Bloodhawk"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/141-bullseye.jpg",
    "name": "Bullseye"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/145-cable.jpg",
    "name": "Cable"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/148-cannonball.jpg",
    "name": "Cannonball"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/149-captain-america.jpg",
    "name": "Captain America"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/151-captain-britain.jpg",
    "name": "Captain Britain"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/160-captain-planet.jpg",
    "name": "Captain Planet"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/162-carnage.jpg",
    "name": "Carnage"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/167-century.jpg",
    "name": "Century"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/169-chamber.jpg",
    "name": "Chamber"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/171-changeling.jpg",
    "name": "Changeling"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/180-cloak.jpg",
    "name": "Cloak"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/185-colossus.jpg",
    "name": "Colossus"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/188-cottonmouth.jpg",
    "name": "Cottonmouth"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/196-cyclops.jpg",
    "name": "Cyclops"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/201-daredevil.jpg",
    "name": "Daredevil"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/202-darkhawk.jpg",
    "name": "Darkhawk"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/215-deathlok.jpg",
    "name": "Deathlok"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/217-demogoblin.jpg",
    "name": "Demogoblin"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/218-destroyer.jpg",
    "name": "Destroyer"
  }
];

const marvelGirls = [
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/25-angel-dust.jpg",
    "name": "Angel Dust"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/39-arachne.jpg",
    "name": "Arachne"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/41-arclight.jpg",
    "name": "Arclight"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/42-ardina.jpg",
    "name": "Ardina"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/44-ariel.jpg",
    "name": "Ariel"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/45-armor.jpg",
    "name": "Armor"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/56-aurora.jpg",
    "name": "Aurora"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/99-black-cat.jpg",
    "name": "Black Cat"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/104-black-mamba.jpg",
    "name": "Black Mamba"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/107-black-widow.jpg",
    "name": "Black Widow"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/114-bling!.jpg",
    "name": "Bling!"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/115-blink.jpg",
    "name": "Blink"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/120-bloodaxe.jpg",
    "name": "Bloodaxe"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/146-callisto.jpg",
    "name": "Callisto"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/186-copycat.jpg",
    "name": "Copycat"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/191-crystal.jpg",
    "name": "Crystal"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/198-dagger.jpg",
    "name": "Dagger"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/206-darkstar.jpg",
    "name": "Darkstar"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/211-dazzler.jpg",
    "name": "Dazzler"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/227-domino.jpg",
    "name": "Domino"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/238-elektra.jpg",
    "name": "Elektra"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/241-emma-frost.jpg",
    "name": "Emma Frost"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/257-firebird.jpg",
    "name": "Firebird"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/259-firestar.jpg",
    "name": "Firestar"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/271-frenzy.jpg",
    "name": "Frenzy"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/275-gamora.jpg",
    "name": "Gamora"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/286-goblin-queen.jpg",
    "name": "Goblin Queen"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/314-hawkeye-ii.jpg",
    "name": "Hawkeye II"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/321-hela.jpg",
    "name": "Hela"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/323-hellcat.jpg",
    "name": "Hellcat"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/330-hope-summers.jpg",
    "name": "Hope Summers"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/335-husk.jpg",
    "name": "Husk"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/344-invisible-woman.jpg",
    "name": "Invisible Woman"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/358-jennifer-kale.jpg",
    "name": "Jennifer Kale"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/371-jolt.jpg",
    "name": "Jolt"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/372-jubilee.jpg",
    "name": "Jubilee"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/400-lady-deathstrike.jpg",
    "name": "Lady Deathstrike"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/419-luna.jpg",
    "name": "Luna"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/431-mantis.jpg",
    "name": "Mantis"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/433-marvel-girl.jpg",
    "name": "Marvel Girl"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/441-medusa.jpg",
    "name": "Medusa"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/462-mockingbird.jpg",
    "name": "Mockingbird"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/471-moonstone.jpg",
    "name": "Moonstone"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/480-mystique.jpg",
    "name": "Mystique"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/483-namora.jpg",
    "name": "Namora"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/484-namorita.jpg",
    "name": "Namorita"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/487-nebula.jpg",
    "name": "Nebula"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/488-negasonic-teenage-warhead.jpg",
    "name": "Negasonic Teenage Warhead"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/497-nova.jpg",
    "name": "Nova"
  },
  {
    "url": "https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/images/md/523-polaris.jpg",
    "name": "Polaris"
  }
];export { marvelBoys, marvelGirls };
