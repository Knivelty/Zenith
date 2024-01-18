use autochessia::array2d::{Array2DTrait, Array2D};
use autochessia::array2w::{Array2WayTrait, Array2Way, SimpleU8Array2Way};
use autochessia::pq::{PQTrait, PQ};
use autochessia::models::{Vec2, Pos};

trait ChessBoardTrait<CB, P> {
    fn new(x: usize, y: usize, empty: P, boarder: P) -> CB;
    fn get_empty(self: @CB) -> P;
    fn get_boarder(self: @CB) -> P;
    fn len(ref self: CB) -> (usize, usize);
    fn get_piece(ref self: CB, x: usize, y: usize) -> P;
    fn set_piece(ref self: CB, x: usize, y: usize, piece: P);
}

impl ChessBoardIndex<CB, P, +ChessBoardTrait<CB, P>> of Index<CB, (usize, usize), P> {
    #[inline(always)]
    fn index(ref self: CB, index: (usize, usize)) -> P {
        let (x, y) = index;
        self.get_piece(x, y)
    }
}

trait ChessBoardUtilsTrait<CB, P> {
    fn is_empty(ref self: CB, x: usize, y: usize) -> bool;
    fn is_boarder(ref self: CB, x: usize, y: usize) -> bool;
    fn remove_piece(ref self: CB, x: usize, y: usize);
    fn move_piece(ref self: CB, from: (usize, usize), to: (usize, usize));
    fn find_path_jps(ref self: CB, start: Vec2, end: Vec2) -> Span<Vec2>;
}

impl ChessBoardUtils<CB, P, +Drop<P>, +Copy<P>, +PartialEq<P>, +ChessBoardTrait<CB, P>, +Destruct<CB>> of ChessBoardUtilsTrait<CB, P> {
    fn is_empty(ref self: CB, x: usize, y: usize) -> bool {
        self.get_piece(x, y) == self.get_empty()
    }

    fn is_boarder(ref self: CB, x: usize, y: usize) -> bool {
        self.get_piece(x, y) == self.get_boarder()
    }

    fn remove_piece(ref self: CB, x: usize, y: usize) {
        self.set_piece(x, y, self.get_empty());
    }

    fn move_piece(ref self: CB, from: (usize, usize), to: (usize, usize)) {
        let (from_x, from_y) = from;
        let (to_x, to_y) = to;
        assert(!self.is_empty(from_x, from_y), 'No piece to move');
        assert(self.is_empty(to_x, to_y), 'Destination not empty');
        let piece = self.get_piece(from_x, from_y);
        self.remove_piece(from_x, from_y);
        self.set_piece(to_x, to_y, piece);
    }

    fn find_path_jps(ref self: CB, start: Vec2, end: Vec2) -> Span<Vec2> {
        let mut res: Array<Vec2> = ArrayTrait::<Vec2>::new();
        let (x, y) = self.len();
        let mut source = Array2DTrait::<Array2D<Pos>, Pos>::new(x, y);
        let mut queue = PQTrait::<PQ<Pos>, Pos>::new();
        let mut field = ChessBoardTrait::<ChessBoard<u64>, u64>::new(x, y, 0, x.into() * y.into());
        let mut i = 1;
        loop {
            if i == x - 1 {
                break;
            }
            let mut j = 1;
            loop {
                if j == y - 1 {
                    break;
                }
                if !self.is_empty(i, j) {
                    field.set_piece(i, j, field.get_boarder());
                }
                j = integer::u32_wrapping_add(j, 1);
            };
            i = integer::u32_wrapping_add(i, 1);
        };

        queue.add_task(start.into(), 0);

        loop {
            if queue.is_empty() {
                break;
            }
            let jump_point = queue.pop_task().into();
            if jps_explore_cardinal(ref field, ref source, ref queue, jump_point, end, 1, 0)
                || jps_explore_cardinal(ref field, ref source, ref queue, jump_point, end, 2, 0)
                || jps_explore_cardinal(ref field, ref source, ref queue, jump_point, end, 0, 1)
                || jps_explore_cardinal(ref field, ref source, ref queue, jump_point, end, 0, 2)
                || jps_explore_diagonal(ref field, ref source, ref queue, jump_point, end, 1, 1)
                || jps_explore_diagonal(ref field, ref source, ref queue, jump_point, end, 1, 2)
                || jps_explore_diagonal(ref field, ref source, ref queue, jump_point, end, 2, 1)
                || jps_explore_diagonal(ref field, ref source, ref queue, jump_point, end, 2, 2)
            {
                let mut prePos = end;
                res.append(prePos);
                loop {
                    if prePos == start {
                        break;
                    }
                    prePos = source.get(prePos.x, prePos.y).into();
                    res.append(prePos);
                };
                break;
            }
        };

        res.span()
    }
}

fn next_value(x: usize, direction_x: u8) -> usize {
    if direction_x == 1 {
        integer::u32_wrapping_add(x, 1)
    } else if direction_x == 2 {
        integer::u32_wrapping_sub(x, 1)
    } else {
        x
    }
}

// return max(abs(x1 - x2), abs(y1 - y2))
fn distance(from: Vec2, to: Vec2) -> usize {
    let res_x = if from.x > to.x {
        integer::u32_wrapping_sub(from.x, to.x)
    } else {
        integer::u32_wrapping_sub(to.x, from.x)
    };
    let res_y = if from.y > to.y {
        integer::u32_wrapping_sub(from.y, to.y)
    } else {
        integer::u32_wrapping_sub(to.y, from.y)
    };
    if res_x > res_y {
        res_x
    } else {
        res_y
    }
}

fn jps_explore_cardinal(ref field: ChessBoard<u64>, ref source: Array2D<Pos>, ref pq: PQ<Pos>, start: Vec2, end: Vec2, direction_x: u8, direction_y: u8) -> bool {
    let mut res = false;
    let mut curPos = start;
    let mut curCost = field[(curPos.x, curPos.y)];
    loop {
        let prePos = curPos;
        curPos.x = next_value(curPos.x, direction_x);
        curPos.y = next_value(curPos.y, direction_y);
        curCost = integer::u64_wrapping_add(curCost, 1);
        if curPos == end {
            field.set_piece(curPos.x, curPos.y, curCost);
            source.set(curPos.x, curPos.y, prePos.into());
            res = true;
            break;
        } else if field[(curPos.x, curPos.y)] == field.get_empty() {
            field.set_piece(curPos.x, curPos.y, curCost);
            source.set(curPos.x, curPos.y, prePos.into());
        } else {
            break;
        }

        if direction_x == 0 {
            let next_y = next_value(curPos.y, direction_y);
            if field[(integer::u32_wrapping_add(curPos.x, 1), curPos.y)] == field.get_boarder()
                && field[(integer::u32_wrapping_add(curPos.x, 1), next_y)] < field.get_boarder() {
                pq.add_task(curPos.into(), distance(curPos, end).into());
                break;
            }
            if field[(integer::u32_wrapping_sub(curPos.x, 1), curPos.y)] == field.get_boarder()
                && field[(integer::u32_wrapping_sub(curPos.x, 1), next_y)] < field.get_boarder() {
                pq.add_task(curPos.into(), distance(curPos, end).into());
                break;
            }
        } else if direction_y == 0 {
            let next_x = next_value(curPos.x, direction_x);
            if field[(curPos.x, integer::u32_wrapping_add(curPos.y, 1))] == field.get_boarder()
                && field[(next_x, integer::u32_wrapping_add(curPos.y, 1))] < field.get_boarder() {
                pq.add_task(curPos.into(), distance(curPos, end).into());
                break;
            }
            if field[(curPos.x, integer::u32_wrapping_sub(curPos.y, 1))] == field.get_boarder()
                && field[(next_x, integer::u32_wrapping_sub(curPos.y, 1))] < field.get_boarder() {
                pq.add_task(curPos.into(), distance(curPos, end).into());
                break;
            }
        }
    };
    res
}

fn jps_explore_diagonal(ref field: ChessBoard<u64>, ref source: Array2D<Pos>, ref pq: PQ<Pos>, start: Vec2, end: Vec2, direction_x: u8, direction_y: u8) -> bool {
    let mut res = false;
    let mut curPos = start;
    let mut curCost = field[(curPos.x, curPos.y)];
    loop {
        let prePos = curPos;
        curPos.x = next_value(curPos.x, direction_x);
        curPos.y = next_value(curPos.y, direction_y);
        curCost = integer::u64_wrapping_add(curCost, 1);
        if curPos == end {
            field.set_piece(curPos.x, curPos.y, curCost);
            source.set(curPos.x, curPos.y, prePos.into());
            res = true;
            break;
        } else if field[(curPos.x, curPos.y)] == field.get_empty() {
            field.set_piece(curPos.x, curPos.y, curCost);
            source.set(curPos.x, curPos.y, prePos.into());
        } else {
            break;
        }

        if field[(prePos.x, curPos.y)] == field.get_boarder()
            && field[(prePos.x, next_value(curPos.y, direction_y))] < field.get_boarder() {
            pq.add_task(curPos.into(), distance(curPos, end).into());
            break;
        }
        if field[(curPos.x, prePos.y)] == field.get_boarder()
            && field[(next_value(curPos.x, direction_x), prePos.y)] < field.get_boarder() {
            pq.add_task(curPos.into(), distance(curPos, end).into());
            break;
        }
        if jps_explore_cardinal(ref field, ref source, ref pq, curPos, end, direction_x, 0) {
            res = true;
            break;
        }
        if jps_explore_cardinal(ref field, ref source, ref pq, curPos, end, 0, direction_y) {
            res = true;
            break;
        }
    };
    res
}

struct ChessBoard<P> {
    arr: Array2D<P>,
    boarder: P,
    empty: P,
}

impl DestructChessBoard<P, +Drop<P>, +Felt252DictValue<P>> of Destruct<ChessBoard<P>> {
    fn destruct(self: ChessBoard<P>) nopanic {
        self.arr.destruct();
    }
}

impl ChessBoardTraitImpl<P, +Drop<P>, +Copy<P>, +Felt252DictValue<P>> of ChessBoardTrait<ChessBoard<P>, P> {
    fn new(x: usize, y: usize, empty: P, boarder: P) -> ChessBoard<P> {
        assert(x > 2, 'invalid argument x');
        assert(y > 2, 'invalid argument y');
        ChessBoard {
            arr: Array2DTrait::<Array2D<P>, P>::new(x - 2, y - 2),
            boarder: boarder,
            empty: empty
        }
    }

    fn get_empty(self: @ChessBoard<P>) -> P {
        *self.empty
    }

    fn get_boarder(self: @ChessBoard<P>) -> P {
        *self.boarder
    }

    fn len(ref self: ChessBoard<P>) -> (usize, usize) {
        (self.arr.x + 2, self.arr.y + 2)
    }

    fn get_piece(ref self: ChessBoard<P>, x: usize, y: usize) -> P {
        assert(x < self.arr.x + 2, 'Index out of bounds');
        assert(y < self.arr.y + 2, 'Index out of bounds');
        if x == 0 || x == self.arr.x + 1 || y == 0 || y == self.arr.y + 1 {
            self.boarder
        } else {
            self.arr.get(x - 1, y - 1)
        }
    }

    fn set_piece(ref self: ChessBoard<P>, x: usize, y: usize, piece: P) {
        assert(x > 0, 'Index out of bounds');
        assert(y > 0, 'Index out of bounds');
        self.arr.set(x - 1, y - 1, piece);
    }
}

// // following implementation cost 2x more gas than the above one
// // since we have dictionary instead of array, using one single dict with structured key is more gas efficient 
// #[derive(Destruct)]
// struct ChessBoardBackup {
//     board: Array2Way<Nullable<SimpleU8Array2Way>>,
//     // x == board.len(),
//     y: usize,
//     boarder: u8,
// }

// impl ChessBoardBackupImpl of ChessBoardTrait<ChessBoardBackup, u8> {
//     fn new(x: usize, y: usize, empty: u8, boarder: u8) -> ChessBoardBackup {
//         assert(x <= 16 && x > 0, 'Invalid argument x');
//         assert(y <= 16 && y > 0, 'Invalid argument y');
//         ChessBoardBackup {
//             board: Array2WayTrait::<Array2Way<Nullable<SimpleU8Array2Way>>, Nullable<SimpleU8Array2Way>>::new_with_length(x),
//             y: y,
//             boarder: boarder,
//         }
//     }

//     fn len(ref self: ChessBoardBackup) -> (usize, usize) {
//         (self.board.len() + 2, self.y + 2)
//     }

//     fn get_empty(self: @ChessBoardBackup) -> u8 {
//         0
//     }

//     fn get_boarder(self: @ChessBoardBackup) -> u8 {
//         *self.boarder
//     }

//     fn get_piece(ref self: ChessBoardBackup, x: usize, y: usize) -> u8 {
//         assert(x < self.board.len() + 2, 'Index out of bounds');
//         assert(y < self.y + 2, 'Index out of bounds');
//         if x == 0 || x == self.board.len() + 1 || y == 0 || y == self.y + 1 {
//             self.boarder
//         } else {
//             let mut x_column = self.board.get(x - 1).deref_or(Array2WayTrait::<SimpleU8Array2Way, u8>::new_with_length(self.y));
//             x_column.get(y - 1)
//         }
//     }

//     fn set_piece(ref self: ChessBoardBackup, x: usize, y: usize, piece: u8) {
//         assert(x > 0, 'Index out of bounds');
//         assert(y > 0, 'Index out of bounds');
//         let mut x_column = self.board.get(x - 1).deref_or(Array2WayTrait::<SimpleU8Array2Way, u8>::new_with_length(self.y));
//         x_column.set(y - 1, piece);
//         self.board.set(x - 1, NullableTrait::new(x_column));
//     }
// }

#[test]
fn test_chess_board() {
    let mut board = ChessBoardTrait::<ChessBoard<u8>, u8>::new(10, 10, 0, 255);
    assert!(board.len() == (10, 10));
    assert!(board.get_piece(0, 0) == 255);
    assert!(board.get_piece(1, 1) == 0);
    assert!(board.get_piece(8, 8) == 0);
    assert!(board.get_piece(9, 9) == 255);
    assert!(board.get_piece(0, 1) == 255);
    assert!(board.get_piece(1, 0) == 255);
    assert!(board.get_piece(9, 8) == 255);
    assert!(board.get_piece(8, 9) == 255);
    assert!(board.is_empty(1, 1));
    assert!(board.is_empty(8, 8));
    assert!(!board.is_empty(0, 1));
    assert!(!board.is_empty(1, 0));
    assert!(!board.is_empty(9, 8));
    assert!(!board.is_empty(8, 9));
    assert!(!board.is_boarder(1, 1));
    assert!(!board.is_boarder(8, 8));
    assert!(board.is_boarder(0, 0));
    assert!(board.is_boarder(9, 9));
    assert!(board.is_boarder(0, 1));
    assert!(board.is_boarder(1, 0));
    assert!(board.is_boarder(9, 8));
    assert!(board.is_boarder(8, 9));
    assert!(board.get_piece(1, 1) == 0);
    board.set_piece(1, 1, 1);
    assert!(board.get_piece(1, 1) == 1);
    board.remove_piece(1, 1);
    assert!(board.get_piece(1, 1) == 0);
    board.set_piece(1, 1, 1);
    board.move_piece((1, 1), (2, 2));
    assert!(board.get_piece(1, 1) == 0);
    assert!(board.get_piece(2, 2) == 1);
    assert!(board.is_empty(1, 1));
    assert!(!board.is_empty(2, 2));
}

#[test]
fn test_jps() {
    let mut board = ChessBoardTrait::<ChessBoard<u8>, u8>::new(5, 5, 0, 255);
    board.set_piece(2, 1, 1);
    board.set_piece(2, 2, 1);
    let res = board.find_path_jps(Vec2{x: 1, y: 1}, Vec2{x: 3, y: 1});
    let len = res.len();
    println!("len: {}", len);
    let mut i = 0;
    loop {
        if i == len {
            break;
        }
        let pos = *res.at(i);
        println!("value: {} {}", pos.x, pos.y);
        i += 1;
    };
}