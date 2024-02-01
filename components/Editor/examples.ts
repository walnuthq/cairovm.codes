import { ExampleCode } from './types'

const examples: ExampleCode = {
  Cairo: [
    `use core::felt252;

fn main() -> felt252 {
    let n = 2 + 3;
    n
}`,
  ],
  Sierra: [
    `type felt252 = felt252 [storable: true, drop: true, dup: true, zero_sized: false];
type core::panics::Panic = Struct<ut@core::panics::Panic> [storable: true, drop: true, dup: true, zero_sized: true];
type Array<felt252> = Array<felt252> [storable: true, drop: true, dup: false, zero_sized: false];
type NonZero<felt252> = NonZero<felt252> [storable: true, drop: true, dup: true, zero_sized: false];
type BuiltinCosts = BuiltinCosts [storable: true, drop: true, dup: true, zero_sized: false];
type Tuple<core::panics::Panic, Array<felt252>> = Struct<ut@Tuple, core::panics::Panic, Array<felt252>> [storable: true, drop: true, dup: false, zero_sized: false];
type Tuple<felt252> = Struct<ut@Tuple, felt252> [storable: true, drop: true, dup: true, zero_sized: false];
type core::panics::PanicResult::<(core::felt252,)> = Enum<ut@core::panics::PanicResult::<(core::felt252,)>, Tuple<felt252>, Tuple<core::panics::Panic, Array<felt252>>> [storable: true, drop: true, dup: false, zero_sized: false];
type GasBuiltin = GasBuiltin [storable: true, drop: false, dup: false, zero_sized: false];
type RangeCheck = RangeCheck [storable: true, drop: false, dup: false, zero_sized: false];

libfunc disable_ap_tracking = disable_ap_tracking;
libfunc felt252_const<10> = felt252_const<10>;
libfunc felt252_const<1> = felt252_const<1>;
libfunc store_temp<RangeCheck> = store_temp<RangeCheck>;
libfunc store_temp<GasBuiltin> = store_temp<GasBuiltin>;
libfunc store_temp<felt252> = store_temp<felt252>;
libfunc function_call<user@fibonacci::fibonacci::fib> = function_call<user@fibonacci::fibonacci::fib>;
libfunc enum_match<core::panics::PanicResult::<(core::felt252,)>> = enum_match<core::panics::PanicResult::<(core::felt252,)>>;
libfunc branch_align = branch_align;
libfunc struct_deconstruct<Tuple<felt252>> = struct_deconstruct<Tuple<felt252>>;
libfunc struct_construct<Tuple<felt252>> = struct_construct<Tuple<felt252>>;
libfunc enum_init<core::panics::PanicResult::<(core::felt252,)>, 0> = enum_init<core::panics::PanicResult::<(core::felt252,)>, 0>;
libfunc store_temp<core::panics::PanicResult::<(core::felt252,)>> = store_temp<core::panics::PanicResult::<(core::felt252,)>>;
libfunc enum_init<core::panics::PanicResult::<(core::felt252,)>, 1> = enum_init<core::panics::PanicResult::<(core::felt252,)>, 1>;
libfunc get_builtin_costs = get_builtin_costs;
libfunc store_temp<BuiltinCosts> = store_temp<BuiltinCosts>;
libfunc withdraw_gas_all = withdraw_gas_all;
libfunc dup<felt252> = dup<felt252>;
libfunc felt252_is_zero = felt252_is_zero;
libfunc drop<felt252> = drop<felt252>;
libfunc jump = jump;
libfunc drop<NonZero<felt252>> = drop<NonZero<felt252>>;
libfunc felt252_add = felt252_add;
libfunc felt252_sub = felt252_sub;
libfunc array_new<felt252> = array_new<felt252>;
libfunc felt252_const<375233589013918064796019> = felt252_const<375233589013918064796019>;
libfunc array_append<felt252> = array_append<felt252>;
libfunc struct_construct<core::panics::Panic> = struct_construct<core::panics::Panic>;
libfunc struct_construct<Tuple<core::panics::Panic, Array<felt252>>> = struct_construct<Tuple<core::panics::Panic, Array<felt252>>>;

disable_ap_tracking() -> (); // 0
felt252_const<10>() -> ([2]); // 1
felt252_const<1>() -> ([3]); // 2
felt252_const<1>() -> ([4]); // 3
store_temp<RangeCheck>([0]) -> ([0]); // 4
store_temp<GasBuiltin>([1]) -> ([1]); // 5
store_temp<felt252>([3]) -> ([3]); // 6
store_temp<felt252>([4]) -> ([4]); // 7
store_temp<felt252>([2]) -> ([2]); // 8
function_call<user@fibonacci::fibonacci::fib>([0], [1], [3], [4], [2]) -> ([5], [6], [7]); // 9
enum_match<core::panics::PanicResult::<(core::felt252,)>>([7]) { fallthrough([8]) 19([9]) }; // 10
branch_align() -> (); // 11
struct_deconstruct<Tuple<felt252>>([8]) -> ([10]); // 12
struct_construct<Tuple<felt252>>([10]) -> ([11]); // 13
enum_init<core::panics::PanicResult::<(core::felt252,)>, 0>([11]) -> ([12]); // 14
store_temp<RangeCheck>([5]) -> ([5]); // 15
store_temp<GasBuiltin>([6]) -> ([6]); // 16
store_temp<core::panics::PanicResult::<(core::felt252,)>>([12]) -> ([12]); // 17
return([5], [6], [12]); // 18
branch_align() -> (); // 19
enum_init<core::panics::PanicResult::<(core::felt252,)>, 1>([9]) -> ([13]); // 20
store_temp<RangeCheck>([5]) -> ([5]); // 21
store_temp<GasBuiltin>([6]) -> ([6]); // 22
store_temp<core::panics::PanicResult::<(core::felt252,)>>([13]) -> ([13]); // 23
return([5], [6], [13]); // 24
disable_ap_tracking() -> (); // 25
get_builtin_costs() -> ([5]); // 26
store_temp<BuiltinCosts>([5]) -> ([5]); // 27
withdraw_gas_all([0], [1], [5]) { fallthrough([6], [7]) 70([8], [9]) }; // 28
branch_align() -> (); // 29
dup<felt252>([4]) -> ([4], [10]); // 30
store_temp<RangeCheck>([6]) -> ([6]); // 31
felt252_is_zero([10]) { fallthrough() 40([11]) }; // 32
branch_align() -> (); // 33
drop<felt252>([4]) -> (); // 34
drop<felt252>([3]) -> (); // 35
store_temp<RangeCheck>([6]) -> ([12]); // 36
store_temp<GasBuiltin>([7]) -> ([13]); // 37
store_temp<felt252>([2]) -> ([14]); // 38
jump() { 58() }; // 39
branch_align() -> (); // 40
drop<NonZero<felt252>>([11]) -> (); // 41
dup<felt252>([3]) -> ([3], [15]); // 42
felt252_add([2], [15]) -> ([16]); // 43
felt252_const<1>() -> ([17]); // 44
felt252_sub([4], [17]) -> ([18]); // 45
store_temp<RangeCheck>([6]) -> ([6]); // 46
store_temp<GasBuiltin>([7]) -> ([7]); // 47
store_temp<felt252>([3]) -> ([3]); // 48
store_temp<felt252>([16]) -> ([16]); // 49
store_temp<felt252>([18]) -> ([18]); // 50
function_call<user@fibonacci::fibonacci::fib>([6], [7], [3], [16], [18]) -> ([19], [20], [21]); // 51
enum_match<core::panics::PanicResult::<(core::felt252,)>>([21]) { fallthrough([22]) 64([23]) }; // 52
branch_align() -> (); // 53
struct_deconstruct<Tuple<felt252>>([22]) -> ([24]); // 54
store_temp<RangeCheck>([19]) -> ([12]); // 55
store_temp<GasBuiltin>([20]) -> ([13]); // 56
store_temp<felt252>([24]) -> ([14]); // 57
struct_construct<Tuple<felt252>>([14]) -> ([25]); // 58
enum_init<core::panics::PanicResult::<(core::felt252,)>, 0>([25]) -> ([26]); // 59
store_temp<RangeCheck>([12]) -> ([12]); // 60
store_temp<GasBuiltin>([13]) -> ([13]); // 61
store_temp<core::panics::PanicResult::<(core::felt252,)>>([26]) -> ([26]); // 62
return([12], [13], [26]); // 63
branch_align() -> (); // 64
enum_init<core::panics::PanicResult::<(core::felt252,)>, 1>([23]) -> ([27]); // 65
store_temp<RangeCheck>([19]) -> ([19]); // 66
store_temp<GasBuiltin>([20]) -> ([20]); // 67
store_temp<core::panics::PanicResult::<(core::felt252,)>>([27]) -> ([27]); // 68
return([19], [20], [27]); // 69
branch_align() -> (); // 70
drop<felt252>([4]) -> (); // 71
drop<felt252>([2]) -> (); // 72
drop<felt252>([3]) -> (); // 73
array_new<felt252>() -> ([28]); // 74
felt252_const<375233589013918064796019>() -> ([29]); // 75
store_temp<felt252>([29]) -> ([29]); // 76
array_append<felt252>([28], [29]) -> ([30]); // 77
struct_construct<core::panics::Panic>() -> ([31]); // 78
struct_construct<Tuple<core::panics::Panic, Array<felt252>>>([31], [30]) -> ([32]); // 79
enum_init<core::panics::PanicResult::<(core::felt252,)>, 1>([32]) -> ([33]); // 80
store_temp<RangeCheck>([8]) -> ([8]); // 81
store_temp<GasBuiltin>([9]) -> ([9]); // 82
store_temp<core::panics::PanicResult::<(core::felt252,)>>([33]) -> ([33]); // 83
return([8], [9], [33]); // 84

fibonacci::fibonacci::main@0([0]: RangeCheck, [1]: GasBuiltin) -> (RangeCheck, GasBuiltin, core::panics::PanicResult::<(core::felt252,)>);
fibonacci::fibonacci::fib@25([0]: RangeCheck, [1]: GasBuiltin, [2]: felt252, [3]: felt252, [4]: felt252) -> (RangeCheck, GasBuiltin, core::panics::PanicResult::<(core::felt252,)>);
`,
  ],
  CASM: [
    `[ap + 0] = [fp + -4], ap++;
[ap + 0] = [fp + -3], ap++;
[ap + 0] = 1, ap++;
[ap + 0] = 1, ap++;
[ap + 0] = 10, ap++;
call rel 19;
jmp rel 10 if [ap + -3] != 0;
[ap + 0] = [ap + -5], ap++;
[ap + 0] = [ap + -5], ap++;
[ap + 0] = 0, ap++;
[ap + 0] = 0, ap++;
[ap + 0] = [ap + -5], ap++;
ret;
[ap + 0] = [ap + -5], ap++;
[ap + 0] = [ap + -5], ap++;
[ap + 0] = 1, ap++;
[ap + 0] = [ap + -5], ap++;
[ap + 0] = [ap + -5], ap++;
ret;
call rel 68;
[ap + 0] = [ap + -1] + 67, ap++;
[ap + 0] = [[ap + -1] + 0], ap++;
%{ memory[ap + 0] = 2570 <= memory[fp + -6] %}
jmp rel 9 if [ap + 0] != 0, ap++;
[fp + -6] = [ap + 0] + 2570, ap++;
[ap + 0] = [ap + -1] + 340282366920938463463374607431768211456, ap++;
[ap + -1] = [[fp + -7] + 0];
jmp rel 42;
[fp + -6] = [ap + 0] + 2570, ap++;
[ap + -1] = [[fp + -7] + 0];
[ap + 0] = [fp + -7] + 1, ap++;
jmp rel 7 if [fp + -3] != 0;
[ap + 0] = [ap + -1], ap++;
[ap + 0] = [ap + -3], ap++;
[ap + 0] = [fp + -5], ap++;
jmp rel 15;
[ap + 0] = [ap + -1], ap++;
[ap + 0] = [ap + -3], ap++;
[ap + 0] = [fp + -4], ap++;
[ap + 0] = [fp + -5] + [fp + -4], ap++;
[fp + -3] = [ap + 0] + 1, ap++;
call rel -32;
jmp rel 13 if [ap + -3] != 0;
[ap + 0] = [ap + -5], ap++;
[ap + 0] = [ap + -5], ap++;
[ap + 0] = [ap + -3], ap++;
[ap + 0] = [ap + -3], ap++;
[ap + 0] = [ap + -3], ap++;
[ap + 0] = 0, ap++;
[ap + 0] = 0, ap++;
[ap + 0] = [ap + -5], ap++;
ret;
[ap + 0] = [ap + -5], ap++;
[ap + 0] = [ap + -5], ap++;
[ap + 0] = 1, ap++;
[ap + 0] = [ap + -5], ap++;
[ap + 0] = [ap + -5], ap++;
ret;
%{ memory[ap + 0] = segments.add() %}
ap += 1;
[ap + 0] = 375233589013918064796019, ap++;
[ap + -1] = [[ap + -2] + 0];
[ap + 0] = [fp + -7] + 1, ap++;
[ap + 0] = [fp + -6], ap++;
[ap + 0] = 1, ap++;
[ap + 0] = [ap + -5], ap++;
[ap + 0] = [ap + -6] + 1, ap++;
ret;
`,
  ],
  //   Bytecode: ['604260005260206000F3'],
  //   Mnemonic: [
  //     `PUSH1 0x42
  // PUSH1 0
  // MSTORE
  // PUSH1 32
  // PUSH1 0
  // RETURN`,
  //   ],
}

export default examples
