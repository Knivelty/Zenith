use autochessia::array2w::{Array2WayTrait, Array2Way, SimpleU8Array2Way};
use autochessia::utils::exp_256;

trait BoardTrait<B, T> {
    fn new(x: usize, y: usize) -> B;
    fn get(ref self: B, x: usize, y: usize) -> T;
    fn len_x(ref self: B) -> usize;
    fn len_y(ref self: B) -> usize;
    fn set(ref self: B, x: usize, y: usize, val: T);
}

trait PathableBoardTrait<B, T, impl BoardImpl: BoardTrait<B, T>> {
    fn add_borders(ref self: B) -> B;
}

impl BoardIndex<B, T, impl BoardTraitImpl: BoardTrait<B, T>> of Index<B, (usize, usize), T> {
    #[inline(always)]
    fn index(ref self: B, index: (usize, usize)) -> T {
        let (x, y) = index;
        self.get(x, y)
    }
}

// type ColumnU128 = u128;

// impl ColumnIndex of Index<ColumnU128, usize, u8> {
//     #[inline(always)]
//     fn index(ref self: ColumnU128, index: usize) -> u8 {
//         self.get_y(index)
//     }
// }

// #[generate_trait]
// impl ChessColumnTrait of ColumnTrait {
//     fn new_column() -> ColumnU128 {
//         0_u128
//     }

//     fn get_y(ref self: ColumnU128, y: usize) -> u8 {
//         assert(y < 16, 'Index out of bounds');
//         let divisor: u128 = exp_256(y);
//         ((self / divisor) % 0x100).try_into().unwrap()
//     }

//     fn len_y(self: @ColumnU128) -> usize {
//         16
//     }

//     fn set_y(ref self: ColumnU128, y: usize, val: u8) {
//         let original = self.get_y(y);
//         let divisor = exp_256(y);
//         let left = integer::u128_wrapping_sub(self, original.into() * divisor);
//         self = integer::u128_wrapping_add(left, val.into() * divisor);
//     }
// }

#[derive(Destruct)]
struct ChessBoard {
    board: Array2Way<Nullable<SimpleU8Array2Way>>,
    // x == board.len(),
    y: usize,
}

impl ChessBoardImpl of BoardTrait<ChessBoard, u8> {
    fn new(x: usize, y: usize) -> ChessBoard {
        assert(x <= 16 && x > 0, 'Invalid argument x');
        assert(y <= 16 && y > 0, 'Invalid argument y');
        ChessBoard {
            board: Array2WayTrait::<Array2Way<Nullable<SimpleU8Array2Way>>, Nullable<SimpleU8Array2Way>>::new_with_length(x),
            y: y,
        }
    }

    fn get(ref self: ChessBoard, x: usize, y: usize) -> u8 {
        assert(x < self.board.len(), 'Index out of bounds');
        let mut x_column = self.board.get(x).deref_or(Array2WayTrait::<SimpleU8Array2Way, u8>::new_with_length(self.y));
        assert(y < x_column.len(), 'Index out of bounds');
        x_column.get(y)
    }

    fn len_x(ref self: ChessBoard) -> usize {
        self.board.len()
    }

    fn len_y(ref self: ChessBoard) -> usize {
        let mut column_0 = self.board.get(0).deref_or(Array2WayTrait::<SimpleU8Array2Way, u8>::new_with_length(self.y));
        column_0.len()
    }

    fn set(ref self: ChessBoard, x: usize, y: usize, val: u8) {
        let mut x_column = self.board.get(x).deref_or(Array2WayTrait::<SimpleU8Array2Way, u8>::new_with_length(self.y));
        x_column.set(y, val);
        self.board.set(x, NullableTrait::new(x_column));
    }
}

// impl ChessBoardPathableImpl of PathableBoardTrait<ChessBoard, u8, ChessBoardImpl> {
//     fn add_borders(ref self: ChessBoard) -> ChessBoard {
//         let x_len = integer::u32_wrapping_add(self.len_x(), 2);
//         let y_len = integer::u32_wrapping_add(self.len_y(), 2);
//         let mut new_board = ChessBoardImpl::new(x_len, y_len);
//         let mut j = y_len;
//         let mut left_border = 0_u128;
//         loop {
//             if j == 0 {
//                 break;
//             }
//             j = integer::u32_wrapping_sub(j, 1);
//             left_border = integer::u128_wrapping_add((left_border * 0x100), 1);
//         };
//         new_board.board.set(0, left_border);
//         new_board.board.set(integer::u32_wrapping_sub(x_len, 1), left_border);

//         let mut ithColumn = 0_u128;
//         let mut i = self.len_x();
//         loop {
//             if i == 0 {
//                 break;
//             }
//             i = integer::u32_wrapping_sub(i, 1);
//             ithColumn = self.board.get(i);
//             ithColumn = integer::u128_wrapping_add((ithColumn * 0x100), 1);
//             ithColumn = integer::u128_wrapping_add(ithColumn, exp_256(integer::u32_wrapping_sub(y_len, 1)));
//             new_board.board.set(integer::u32_wrapping_add(i, 1), ithColumn);
//         };
//         new_board
//     }
// }

#[test]
fn test_chess_board() {
    let mut board = BoardTrait::<ChessBoard, u8>::new(8, 8);
    assert!(board.len_x() == 8);
    assert!(board.len_y() == 8);
    assert!(board[(0, 0)] == 0);
    assert!(board.get(1, 7) == 0);
    board.set(1, 7, 1);
    assert!(board[(1, 7)] == 1);
    // let mut pathable_board = board.add_borders();
    // assert!(pathable_board.len_x() == 10);
    // assert!(pathable_board.len_y() == 10);
    // assert!(pathable_board[(0, 0)] == 1);
    // assert!(pathable_board[(0, 1)] == 1);
    // assert!(pathable_board[(9, 9)] == 1);
    // assert!(pathable_board[(9, 8)] == 1);
    // assert!(pathable_board[(1, 9)] == 1);
    // assert!(pathable_board[(9, 0)] == 1);
    // assert!(pathable_board[(2, 8)] == 1);
}