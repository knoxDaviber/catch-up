import { initialState, legalMoves, applyMove, MiniChess, inCheckState } from './engine.js';
const E={initialState,legalMoves,applyMove,MiniChess,inCheckState};
function fen(f){const [pl,t,c,ep]=f.split(' ');const b=Array(64).fill(null);const rows=pl.split('/');
 for(let ri=0;ri<8;ri++){let file=0;for(const ch of rows[ri]){if(/\d/.test(ch))file+=+ch;else{const color=ch===ch.toUpperCase()?'w':'b';b[(7-ri)*8+file]=color+ch.toLowerCase();file++;}}}
 return {b,t,c:{wK:c.includes('K'),wQ:c.includes('Q'),bK:c.includes('k'),bQ:c.includes('q')},ep:ep==='-'?-1:('abcdefgh'.indexOf(ep[0])+(+ep[1]-1)*8),half:0};}
function perft(st,d){if(d===0)return 1;const ms=E.legalMoves(st);if(d===1)return ms.length;let n=0;for(const m of ms)n+=perft(E.applyMove(st,m),d-1);return n;}
const tests=[
 ['start',E.initialState(),[20,400,8902,197281]],
 ['kiwipete',fen('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -'),[48,2039,97862]],
 ['pos3',fen('8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -'),[14,191,2812,43238]],
 ['pos4',fen('r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1'),[6,264,9467]],
 ['pos5',fen('rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8'),[44,1486,62379]],
];
let ok=true;
for(const [name,st,exp] of tests){exp.forEach((e,i)=>{const got=perft(st,i+1);const pass=got===e;if(!pass)ok=false;console.log(name,'depth',i+1,got,pass?'OK':'EXPECTED '+e);});}
// API: fool's mate
const g=new E.MiniChess();
['f2f3','e7e5','g2g4','d8h4'].forEach(m=>g.move({from:m.slice(0,2),to:m.slice(2)}));
console.log('fool mate: checkmate',g.in_checkmate(),'game_over',g.game_over(),'turn',g.turn());
console.log('illegal move rejected:',new E.MiniChess().move({from:'e2',to:'e5'})===null);
const h=new E.MiniChess();console.log('moves from g1:',h.moves({square:'g1'}).map(m=>m.to).join(','));
<<<<<<< HEAD
// threefold repetition: knights out and back twice
const r=new E.MiniChess();['g1f3','g8f6','f3g1','f6g8','g1f3','g8f6','f3g1','f6g8'].forEach(m=>r.move({from:m.slice(0,2),to:m.slice(2)}));
console.log('threefold:',r.in_threefold(),'draw',r.in_draw());if(!r.in_threefold())ok=false;
// undo restores the position
const u=new E.MiniChess();u.move({from:'e2',to:'e4'});u.move({from:'e7',to:'e5'});u.undo(2);const back=u.turn()==='w'&&u.history()===0&&u.moves().length===20;
console.log('undo:',back);if(!back)ok=false;
=======
>>>>>>> origin/main
console.log(ok?'ALL PERFT OK':'PERFT FAILURES');
