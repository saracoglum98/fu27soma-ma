# Multi-Level Shuttle System

## Function of a Multi-Level Shuttle (MLS)

A multi-level shuttle is an automated storage system where one shuttle operates multiple levels independently. High throughput is achieved through parallel operation of multiple levels within one aisle. The system is typically combined with lifts at the end faces for vertical transport.

## Structure and Components of a Multi-Level Shuttle

**Rack System**: Steel construction with multiple levels, usually in single or double depth, on both sides of one or more aisles. The levels can have different compartment heights, which can be adapted to the load carriers used. The clearance of approximately 100 mm must be considered. Additionally, the lower approach dimension (approximately 350 mm) and the upper approach dimension (approximately 450 mm), which are needed for the equipment, are taken into account. Approximately every 2.5 meters, some space (500 mm) must be left between the compartments, as this is where the maintenance levels are located, which must be mounted on the rack steel structure.

**Mini-RBG (Automated Storage and Retrieval System)**: Automated, mobile storage device that moves horizontally (X-axis), vertically (Y-axis, but only within its own level, not across the complete height) and with a telescopic gripper (Z-direction) for removal/storage into the racks. The telescopic table can pick up 2 load carriers (dimensions 600×400 mm) simultaneously. Typical travel speeds are 4 m/s, lower in shorter aisles. On average, an RBG achieves a performance of 60-70 double cycles per hour. This means that with a double load handling device (LAM), approximately 120-140 load carriers per hour can be stored and retrieved. The system can be built to a maximum height of approximately 12.5 m, which means 5 RBGs stacked on top of each other.

**Lift**: For vertical transport, a lift is needed, which brings the load carriers to the height level of the input and output stations.

**Input and Output Stations**: Each aisle requires a conveyor line for storage and a conveyor line for retrieval. These form the interface between the warehouse and the conveyor technology loop. These two conveyor lines are usually approximately 4 m long, as they form a small buffer especially during storage, so that no congestion occurs in the conveyor technology loop.

**Conveyor Technology**: In addition to the input and output stations, there is a conveyor technology loop, which conceptually represents a conveyor circuit. This connects the input and output stations with the workstations and other necessary conveyor lines. The size depends on the number of aisles, number of workstations, and local conditions.

**Workstations**: At the workstations, both separation/goods receipt/replenishment and order picking take place. Although in many cases one workstation would be sufficient in terms of performance, for redundancy reasons, at least 2 workstations are usually planned. The performance of a workstation depends on the employee themselves, but also on the processes to be completed.

**Storage Containers**: Typically 600×400 mm plastic containers with heights between 100-420 mm. But larger containers with a base area of 800×600 mm can also be used in this storage system. Furthermore, the use of trays (tray builds up with approximately 21 mm) is possible.

## Storage Process

A pallet is served manually or automatically at the workstation. The articles are taken from the pallet and individually placed on trays or in containers. The filled load carrier is pushed onto the conveyor technology and transported via the conveyor technology loop to the input station of the correct aisle. The lift picks up the load carriers and brings the load carriers to the corresponding level. Subsequently, the load carriers are picked up by the respective RBG and stored in the appropriate location.

## Retrieval Process

The RBG moves to the corresponding storage location, removes the load carrier and transports it to the lift. This transports the load carrier to the height level of the input and output stations. The load carrier is forwarded via the conveyor technology to the respective workstation. If the requirement exists, the load carriers are buffered on the way to the workstation and sorted again, so that the load carriers arrive at the workstation in the correct sequence. At the workstation, the article is removed from the load carrier in the correct quantity and stacked on a pallet/roll container. Subsequently, the tray is pushed onto the conveyor technology and stored again.

## Advantages

- Good performance
- Higher redundancy than AKL (Automated Small Parts Warehouse)

## Disadvantages

- Lower storage density in height, as only a maximum of 12.5 m is possible
- Low scalability, only expandable through additional aisles

---

## System Specifications Table

| **Characteristic** | **Specification** |
|---|---|
| **System Height** | Maximum height 12.5 m (Maximum 5 devices stacked) |
| **Performance (per aisle)** | Per device on average approx. 60-70 double cycles/h; with double-LAM approx. 120 storage and retrievals per hour; Bottleneck here is the lift, which is only sufficient for approx. 200 storage and retrievals |
| **Costs (per aisle)** | Medium costs |
| **Redundancy** | Better redundancy than AKL with RBG, as one aisle is served by multiple devices (maximum 5) |
| **Scalability/Flexibility** | Limited, only possible through additional aisles |
| **Floor Space Utilization/Space Utilization** | Poor utilization due to lift technology |
| **Max. Load Carrier Weight** | up to 50 kg |