trait Array2WayTrait<A, T> {
    /// Creates a new A instance.
    /// Returns
    /// * A The new array instance.
    fn new() -> A;

    /// Creates a new A instance with specific length
    /// Parameters
    /// * length The length of the array.
    /// Returns
    /// * A The new array instance.
    fn new_with_length(length: usize) -> A;

    /// Returns the item at the given index, or panics if the index is out of bounds.
    /// Parameters
    /// * self The array instance.
    /// * index The index of the item to get.
    /// Returns
    /// * T The item at the given index.
    fn get(ref self: A, index: usize) -> T;

    /// Pushes a new item to the left of the array.
    /// Parameters
    /// * self The array instance.
    /// * value The value to push into the array.
    fn push_left(ref self: A, value: T);

    /// Pushes a new item to the right of the array.
    /// Parameters
    /// * self The array instance.
    /// * value The value to push into the array.
    fn push_right(ref self: A, value: T);

    /// Pops the leftmost item from the array.
    /// Parameters
    /// * self The array instance.
    fn pop_left(ref self: A) -> T;

    /// Pops the rightmost item from the array.
    /// Parameters
    /// * self The array instance.
    fn pop_right(ref self: A) -> T;

    /// Sets the item at the given index to the given value.
    /// Panics if the index is out of bounds.
    /// Parameters
    /// * self The array instance.
    /// * index The index of the item to set.
    /// * value The value to set the item to.
    fn set(ref self: A, index: usize, value: T);

    /// Returns the length of the array.
    /// Parameters
    /// * self The array instance.
    /// Returns
    /// * usize The length of the array.
    fn len(self: @A) -> usize;
}

impl Array2WayIndex<A, T, impl Array2WayImpl: Array2WayTrait<A, T>> of Index<A, usize, T> {
    #[inline(always)]
    fn index(ref self: A, index: usize) -> T {
        self.get(index)
    }
}

const TWO_TO_32: u64 = 0x100000000_u64;

fn internal_index(index: usize, left: u64) -> u64 {
    integer::u64_wrapping_add(index.into(), left)
}

struct Array2Way<T> {
    left: u64,
    right: u64,
    items: Felt252Dict<T>,
}

impl DestructArray2Way<T, +Drop<T>, +Felt252DictValue<T>> of Destruct<Array2Way<T>> {
    fn destruct(self: Array2Way<T>) nopanic {
        self.items.squash();
    }
}

impl Array2WayImpl<T, +Drop<T>, +Copy<T>, +Felt252DictValue<T>> of Array2WayTrait<Array2Way<T>, T> {
    fn new() -> Array2Way<T> {
        Array2Way { left: TWO_TO_32, right: TWO_TO_32, items: Default::default() }
    }

    fn new_with_length(length: usize) -> Array2Way<T> {
        Array2Way { left: TWO_TO_32, right: integer::u64_wrapping_add(TWO_TO_32, length.into()), items: Default::default() }
    }

    fn get(ref self: Array2Way<T>, index: usize) -> T {
        assert(index < self.len(), 'Index out of bounds');
        self.items.get(internal_index(index, self.left).into())
    }

    fn push_left(ref self: Array2Way<T>, value: T) {
        self.left = integer::u64_wrapping_sub(self.left, 1);
        self.items.insert(self.left.into(), value);
    }

    fn push_right(ref self: Array2Way<T>, value: T) {
        self.items.insert(self.right.into(), value);
        self.right = integer::u64_wrapping_add(self.right, 1);
    }

    fn pop_left(ref self: Array2Way<T>) -> T {
        assert(self.left < self.right, 'Empty array');
        let value = self.items.get(self.left.into());
        self.left = integer::u64_wrapping_add(self.left, 1);
        value
    }

    fn pop_right(ref self: Array2Way<T>) -> T {
        assert(self.left < self.right, 'Empty array');
        self.right = integer::u64_wrapping_sub(self.right, 1);
        self.items.get(self.right.into())
    }

    fn set(ref self: Array2Way<T>, index: usize, value: T) {
        assert(index < self.len(), 'Index out of bounds');
        self.items.insert(internal_index(index, self.left).into(), value);
    }

    fn len(self: @Array2Way<T>) -> usize {
        integer::u64_wrapping_sub(*self.right, *self.left).try_into().unwrap()
    }
}

use autochessia::utils::exp_256;

#[derive(Clone, Drop, Copy, Serde)]
struct SimpleU8Array2Way {
    num: usize,
    items: u128,
}

impl SimpleU8Array2WayFelt252DictValueImpl of Felt252DictValue<SimpleU8Array2Way> {
    #[inline(always)]
    fn zero_default() -> SimpleU8Array2Way nopanic {
        SimpleU8Array2Way { num: 0, items: 0 }
    }
}

impl SimpleU8Array2WayImpl of Array2WayTrait<SimpleU8Array2Way, u8> {
    fn new() -> SimpleU8Array2Way {
        SimpleU8Array2Way { num: 0, items: 0 }
    }

    fn new_with_length(length: usize) -> SimpleU8Array2Way {
        SimpleU8Array2Way { num: length, items: 0 }
    }

    fn get(ref self: SimpleU8Array2Way, index: usize) -> u8 {
        assert(index < self.num, 'Index out of bounds');
        ((self.items / exp_256(index)) % 0x100).try_into().unwrap()
    }

    fn push_left(ref self: SimpleU8Array2Way, value: u8) {
        assert(self.num < 16, 'Array full');
        self.items = integer::u128_wrapping_add(self.items * 0x100, value.into());
        self.num = integer::u32_wrapping_add(self.num, 1);
    }

    fn push_right(ref self: SimpleU8Array2Way, value: u8) {
        assert(self.num < 16, 'Array full');
        self.items = integer::u128_wrapping_add(self.items, value.into() * exp_256(self.num));
        self.num = integer::u32_wrapping_add(self.num, 1);
    }

    fn pop_left(ref self: SimpleU8Array2Way) -> u8 {
        assert(self.num > 0, 'Empty array');
        self.num = integer::u32_wrapping_sub(self.num, 1);
        let left = self.items / 0x100;
        let res = self.items % 0x100;
        self.items = left;
        res.try_into().unwrap()
    }

    fn pop_right(ref self: SimpleU8Array2Way) -> u8 {
        assert(self.num > 0, 'Empty array');
        self.num = integer::u32_wrapping_sub(self.num, 1);
        let divisor = exp_256(self.num);
        let res = self.items / divisor;
        let left = self.items % divisor;
        self.items = left;
        res.try_into().unwrap()
    }

    fn set(ref self: SimpleU8Array2Way, index: usize, value: u8) {
        let original = self.get(index);
        let divisor = exp_256(index);
        let left = integer::u128_wrapping_sub(self.items, original.into() * divisor);
        self.items = integer::u128_wrapping_add(left, value.into() * divisor);
    }

    fn len(self: @SimpleU8Array2Way) -> usize {
        *self.num
    }
}

#[test]
#[available_gas(2000000)]
fn test_array2way() {
    let mut array = Array2WayTrait::<Array2Way<u8>, u8>::new();
    assert!(array.len() == 0);
    array.push_left(1);
    assert!(array.len() == 1);
    array.push_left(2);
    assert!(array.len() == 2);
    array.push_right(3);
    assert!(array.len() == 3);
    array.push_right(4);
    assert_eq!(array.get(0), 2);
    assert_eq!(array[1], 1);
    assert_eq!(array[2], 3);
    assert_eq!(array[3], 4);
    assert!(array.len() == 4);
    assert!(array.pop_left() == 2);
    assert!(array.len() == 3);
    assert!(array.pop_right() == 4);
    assert!(array.len() == 2);
    assert!(array.pop_left() == 1);
    assert!(array.len() == 1);
    assert!(array.pop_right() == 3);
    assert!(array.len() == 0);
}

#[test]
#[available_gas(2000000)]
fn test_simple_u8_array2way() {
    let mut array = Array2WayTrait::<SimpleU8Array2Way, u8>::new();
    assert!(array.len() == 0);
    array.push_left(1);
    assert!(array.len() == 1);
    array.push_left(2);
    assert!(array.len() == 2);
    array.push_right(3);
    assert!(array.len() == 3);
    array.push_right(4);
    assert_eq!(array.get(0), 2);
    assert_eq!(array[1], 1);
    assert_eq!(array[2], 3);
    assert_eq!(array[3], 4);
    assert!(array.len() == 4);
    assert!(array.pop_left() == 2);
    assert!(array.len() == 3);
    assert!(array.pop_right() == 4);
    assert!(array.len() == 2);
    assert!(array.pop_left() == 1);
    assert!(array.len() == 1);
    assert!(array.pop_right() == 3);
    assert!(array.len() == 0);
}

use core::dict::Felt252DictEntryTrait;
use core::nullable::{nullable_from_box, match_nullable, FromNullableResult};

#[test]
#[available_gas(2000000)]
fn test_array_dict() {
    let mut dict = Default::default();
    dict.insert(10, NullableTrait::new(array![1, 2, 3]));
    let (entry, value) = dict.entry(10);
    // assert_eq(@value.deref(), @array![1, 2, 3], 'dict[10] == [1, 2, 3]');
    dict = entry.finalize(NullableTrait::new(array![4, 5]));
    let (entry, value) = dict.entry(10);
    // assert_eq(@value.deref(), @array![4, 5], 'dict[10] == [4, 5]');
    dict = entry.finalize(nullable::null());
    let (entry, value) = dict.entry(10);
    assert(value.is_null(), 'dict[10] == null');
}

#[test]
#[available_gas(2000000)]
fn test_array2way_of_array2way() {
    // the next line is not supported by the compiler yet, with error UnsupportedGenericArg
    // even though SimpleU8Array2Way has already implement Felt252DictValue trait
    // let mut array = Array2WayTrait::<Array2Way<SimpleU8Array2Way>, SimpleU8Array2Way>::new();

    // instead, we can use Nullable to wrap the inner array
    let mut array = Array2WayTrait::<Array2Way<Nullable<SimpleU8Array2Way>>, Nullable<SimpleU8Array2Way>>::new();
}
