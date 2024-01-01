
trait PQTrait<PQ, T> {
    /// Create a new priority queue.
    /// Returns
    /// * PQ The new priority queue instance.
    fn new() -> PQ;

    /// Returns true if the priority queue is empty.
    /// Parameters
    /// * self The priority queue instance.
    /// Returns
    /// * bool True if the priority queue is empty.
    fn is_empty(self: @PQ) -> bool;

    /// Add a task to the priority queue.
    /// Parameters
    /// * self The priority queue instance.
    /// * data The data to add to the priority queue.
    /// * priority The priority of the data.
    fn add_task(ref self: PQ, data: T, priority: u64);

    /// Pop the highest priority task from the priority queue.
    /// Parameters
    /// * self The priority queue instance.
    /// Returns
    /// * T The highest priority task with the lowest priority value.
    fn pop_task(ref self: PQ) -> T;

    /// Clear the priority queue.
    /// Parameters
    /// * self The priority queue instance.
    fn clear(ref self: PQ);
}

struct PQ<T> {
    num: usize,
    data: Felt252Dict<T>,
    priority: Felt252Dict<u64>,
}

impl DestructPQ<T, +Drop<T>, +Felt252DictValue<T>> of Destruct<PQ<T>> {
    fn destruct(self: PQ<T>) nopanic {
        self.data.squash();
        self.priority.squash();
    }
}

impl PQImpl<T, +Drop<T>, +Copy<T>, +Felt252DictValue<T>> of PQTrait<PQ<T>, T> {
    fn new() -> PQ<T> {
        PQ {
            num: 0,
            data: Default::default(),
            priority: Default::default(),
        }
    }

    fn is_empty(self: @PQ<T>) -> bool {
        *self.num == 0
    }

    fn add_task(ref self: PQ<T>, data: T, priority: u64) {
        let mut i = self.num;
        loop {
            if i == 0 {
                break;
            }
            let ithPriority = self.priority.get((i-1).into());
            if ithPriority >= priority {
                break;
            }
            self.priority.insert(i.into(), ithPriority);
            self.data.insert(i.into(), self.data.get((i-1).into()));
            i -= 1;
        };
        self.data.insert(i.into(), data);
        self.priority.insert(i.into(), priority);
        self.num += 1;
    }

    fn pop_task(ref self: PQ<T>) -> T {
        if self.num > 0 {
            self.num -= 1;
            self.data.get(self.num.into())
        } else {
            panic!("pop from empty PQ")
        }
    }

    fn clear(ref self: PQ<T>) {
        self.num = 0;
    }
}

#[derive(Destruct)]
struct PQU64 {
    num: usize,
    dataPrio: Felt252Dict<u128>,
}

impl PQU64Impl of PQTrait<PQU64, u64> {
    fn new() -> PQU64 {
        PQU64 {
            num: 0,
            dataPrio: Default::default(),
        }
    }

    fn is_empty(self: @PQU64) -> bool {
        *self.num == 0
    }

    fn add_task(ref self: PQU64, data: u64, priority: u64) {
        let mut i = self.num;
        loop {
            if i == 0 {
                break;
            }
            let ithDataPrio = self.dataPrio.get((i-1).into());
            if ithDataPrio / 0x10000000000000000_u128 >= priority.into() {
                break;
            }
            self.dataPrio.insert(i.into(), ithDataPrio);
            i -= 1;
        };
        self.dataPrio.insert(i.into(), data.into() * 0x10000000000000000_u128 + priority.into());
        self.num += 1;
    }

    fn pop_task(ref self: PQU64) -> u64 {
        if self.num > 0 {
            self.num -= 1;
            (self.dataPrio.get(self.num.into()) % 0x10000000000000000_u128).try_into().unwrap()
        } else {
            panic!("pop from empty PQ")
        }
    }

    fn clear(ref self: PQU64) {
        self.num = 0;
    }
}

#[test]
#[available_gas(2000000)]
fn test_pq() {
    let mut pq = PQTrait::<PQ<u64>, u64>::new();
    assert!(pq.is_empty());
    pq.add_task(1, 1);
    pq.add_task(2, 2);
    pq.add_task(3, 3);
    assert!(!pq.is_empty());
    assert_eq!(pq.pop_task(), 1);
    assert_eq!(pq.pop_task(), 2);
    assert_eq!(pq.pop_task(), 3);
    assert!(pq.is_empty());
    pq.add_task(1, 1);
    pq.add_task(2, 2);
    pq.add_task(3, 3);
    pq.clear();
    assert!(pq.is_empty());
}

#[test]
#[available_gas(2000000)]
fn test_pqu64() {
    let mut pq = PQTrait::<PQU64, u64>::new();
    assert!(pq.is_empty());
    pq.add_task(1, 1);
    pq.add_task(2, 2);
    pq.add_task(3, 3);
    assert!(!pq.is_empty());
    assert_eq!(pq.pop_task(), 1);
    assert_eq!(pq.pop_task(), 2);
    assert_eq!(pq.pop_task(), 3);
    assert!(pq.is_empty());
    pq.add_task(1, 1);
    pq.add_task(2, 2);
    pq.add_task(3, 3);
    pq.clear();
    assert!(pq.is_empty());
}