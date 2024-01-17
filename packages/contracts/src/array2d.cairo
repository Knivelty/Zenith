trait Array2DTrait<A, T> {
    fn new(x: usize, y: usize) -> A;
    fn get(ref self: A, x: usize, y: usize) -> T;
    fn len_x(self: @A) -> usize;
    fn len_y(self: @A) -> usize;
    fn set(ref self: A, x: usize, y: usize, val: T);
}

impl Array2DIndex<A, T, impl Array2DTraitImpl: Array2DTrait<A, T>> of Index<A, (usize, usize), T> {
    #[inline(always)]
    fn index(ref self: A, index: (usize, usize)) -> T {
        let (x, y) = index;
        self.get(x, y)
    }
}

struct Array2D<T> {
    x: usize,
    y: usize,
    data: Felt252Dict<T>,
}

impl DestructArray2D<T, +Drop<T>, +Felt252DictValue<T>> of Destruct<Array2D<T>> {
    fn destruct(self: Array2D<T>) nopanic {
        self.data.squash();
    }
}

impl Array2DTraitImpl<T, +Drop<T>, +Copy<T>, +Felt252DictValue<T>> of Array2DTrait<Array2D<T>, T> {
    fn new(x: usize, y: usize) -> Array2D<T> {
        Array2D {
            x: x,
            y: y,
            data: Default::default(),
        }
    }

    fn get(ref self: Array2D<T>, x: usize, y: usize) -> T {
        assert(x < self.x, 'Index out of bounds');
        assert(y < self.y, 'Index out of bounds');
        self.data.get(x.into() * 0x100000000_felt252 + y.into())
    }

    fn len_x(self: @Array2D<T>) -> usize {
        *self.x
    }

    fn len_y(self: @Array2D<T>) -> usize {
        *self.y
    }

    fn set(ref self: Array2D<T>, x: usize, y: usize, val: T) {
        assert(x < self.x, 'Index out of bounds');
        assert(y < self.y, 'Index out of bounds');
        self.data.insert(x.into() * 0x100000000_felt252 + y.into(), val);
    }
}

#[test]
fn test_array2d() {
    let mut arr = Array2DTrait::<Array2D<u8>, u8>::new(10, 10);
    arr.set(0, 0, 1);
    arr.set(0, 1, 2);
    arr.set(1, 0, 3);
    arr.set(1, 1, 4);
    assert_eq!(arr[(0, 0)], 1);
    assert_eq!(arr[(0, 1)], 2);
    assert_eq!(arr[(1, 0)], 3);
    assert_eq!(arr[(1, 1)], 4);
}