import type { Category } from '../types';

/** English board. Values run 100-500 with a deliberate difficulty curve. */
export const TRIVIA_EN: Category[] = [
    { name:"Movies & TV", qs:[
      {v:100, q:"Which film became the first non-English-language movie to win the Oscar for Best Picture?", a:"Parasite (2020)"},
      {v:200, q:"In “The Lord of the Rings,” what was Gollum's name before the Ring corrupted him?", a:"Sméagol"},
      {v:300, q:"Which Egyptian-born actor played Sherif Ali in “Lawrence of Arabia” and became a Hollywood star?", a:"Omar Sharif"},
      {v:400, q:"Christopher Nolan finally won his first Best Director Oscar — for which film?", a:"Oppenheimer"},
      {v:500, q:"Only three films have swept the “Big Five” Oscars: Picture, Director, Actor, Actress and Screenplay. “It Happened One Night” is one — name either of the other two.", a:"One Flew Over the Cuckoo's Nest, or The Silence of the Lambs"}
    ]},
    { name:"Music", qs:[
      {v:100, q:"Which Egyptian singer is nicknamed “El Hadaba” (The Plateau)?", a:"Amr Diab"},
      {v:200, q:"Umm Kulthum was given a nickname meaning “Star of the East.” What is it in Arabic?", a:"Kawkab El Sharq"},
      {v:300, q:"Which artist holds the record for the most Grammy Awards ever won by one person?", a:"Beyoncé"},
      {v:400, q:"Umm Kulthum and Mohamed Abdel Wahab's first collaboration in 1964 was hailed as the “meeting of the giants.” Name the song.", a:"Enta Omri"},
      {v:500, q:"“A Day in the Life” closes which Beatles album?", a:"Sgt. Pepper's Lonely Hearts Club Band"}
    ]},
    { name:"Football", qs:[
      {v:100, q:"Which country has won the most FIFA World Cups?", a:"Brazil (5)"},
      {v:200, q:"Egypt holds the record for the most Africa Cup of Nations titles — how many?", a:"7"},
      {v:300, q:"Which club holds the record for the most CAF Champions League titles in African history?", a:"Al Ahly"},
      {v:400, q:"Which defender captained Italy to the 2006 World Cup and won the Ballon d'Or that same year?", a:"Fabio Cannavaro"},
      {v:500, q:"Egypt scored exactly one goal at the 1990 World Cup — a penalty against the Netherlands. Who took it?", a:"Magdy Abdelghani"}
    ]},
    { name:"Geography", qs:[
      {v:100, q:"Which is the largest country in Africa by land area?", a:"Algeria"},
      {v:200, q:"The Nile has two main tributaries — the White Nile and which other?", a:"The Blue Nile"},
      {v:300, q:"Which country contains more natural lakes than the rest of the world combined?", a:"Canada"},
      {v:400, q:"Which is the largest landlocked country in the world by area?", a:"Kazakhstan"},
      {v:500, q:"What is the southernmost capital city in the world?", a:"Wellington, New Zealand"}
    ]},
    { name:"History", qs:[
      {v:100, q:"In what year did World War II end?", a:"1945"},
      {v:200, q:"Whose tomb did Howard Carter uncover in the Valley of the Kings in 1922?", a:"Tutankhamun"},
      {v:300, q:"Who was the last active ruler of ancient Egypt, whose death ended the Ptolemaic Kingdom?", a:"Cleopatra VII"},
      {v:400, q:"Which French scholar deciphered hieroglyphs using the Rosetta Stone in 1822?", a:"Jean-François Champollion"},
      {v:500, q:"At Ain Jalut in 1260, the Mamluks halted the Mongol advance. Which commander from that battle later became Sultan of Egypt?", a:"Baibars (Al-Zahir Baybars)"}
    ]},
    { name:"Science & Tech", qs:[
      {v:100, q:"What do the letters “www” stand for in a web address?", a:"World Wide Web"},
      {v:200, q:"How many bones are in the adult human body?", a:"206"},
      {v:300, q:"Which planet now holds the record for the most confirmed moons in our solar system?", a:"Saturn"},
      {v:400, q:"“LASER” is an acronym. What does it stand for?", a:"Light Amplification by Stimulated Emission of Radiation"},
      {v:500, q:"Which Egyptian-born scientist won the 1999 Nobel Prize in Chemistry for pioneering femtochemistry?", a:"Ahmed Zewail"}
    ]}
  ];
